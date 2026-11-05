// Shared catalog validation. No network or DOM dependencies.
(function(root) {
  "use strict";
  const codePattern = /^[A-Z]+ [0-9]+[A-Z]*$/;
  function code(value) { return String(value).trim().toUpperCase().replace(/\s+/g, " "); }
  function validate(key, value) {
    if (!codePattern.test(code(key))) return "Invalid course code";
    if (typeof value === "string") return value.trim() ? null : "Course name is required";
    if (!value || typeof value !== "object" || Array.isArray(value) || typeof value.name !== "string" || !value.name.trim()) return "Course name is required";
    for (const field of ["examDay", "examSlot", "prerequisiteNote"]) if (value[field] != null && typeof value[field] !== "string") return field + " must be text";
    if (value.credits != null && (typeof value.credits !== "number" || !Number.isFinite(value.credits) || value.credits <= 0)) return "Credits must be a finite positive number";
    const day = (value.examDay || "").trim();
    if (day && !/^(?:day\s*|d)?[1-9]\d*$/i.test(day) && !/^in-class$/i.test(day)) return "Invalid exam day";
    const slot = (value.examSlot || "").trim();
    if (slot && !/^T[123]$/i.test(slot)) return "Invalid exam slot";
    if (/^in-class$/i.test(day) && slot) return "In-class evaluation cannot have an exam slot";
    if (value.prerequisites != null) {
      if (!Array.isArray(value.prerequisites)) return "Prerequisites must be an array";
      const deps = value.prerequisites;
      if (deps.some(p => typeof p !== "string" || (!/^none$/i.test(p.trim()) && !codePattern.test(code(p))))) return "Invalid prerequisite code";
      if (deps.some(p => /^none$/i.test(p.trim())) && deps.length !== 1) return "None cannot be combined with prerequisites";
      if (deps.some(p => code(p) === code(key))) return "A course cannot require itself";
      if (new Set(deps.map(code)).size !== deps.length) return "Duplicate prerequisite";
    }
    return null;
  }
  function cycle(catalog) {
    const state = new Map();
    function visit(key) {
      if (state.get(key) === 1) return key;
      if (state.get(key) === 2) return null;
      state.set(key, 1);
      const entry = catalog[key];
      for (const raw of Array.isArray(entry?.prerequisites) ? entry.prerequisites : []) {
        const dependency = code(raw);
        if (Object.hasOwn(catalog, dependency)) { const found = visit(dependency); if (found) return found; }
      }
      state.set(key, 2); return null;
    }
    for (const key of Object.keys(catalog)) { const found = visit(key); if (found) return found; }
    return null;
  }
  function validateCatalog(catalog) {
    if (!catalog || typeof catalog !== "object" || Array.isArray(catalog)) throw new Error("Catalog must be a JSON object");
    const normalized = Object.create(null);
    for (const [key, value] of Object.entries(catalog)) {
      const error = validate(key, value);
      if (error) throw new Error(key + ": " + error);
      const normalizedCode = code(key);
      if (Object.hasOwn(normalized, normalizedCode)) throw new Error("Duplicate normalized course code: " + normalizedCode);
      normalized[normalizedCode] = value;
    }
    if (cycle(normalized)) throw new Error("Prerequisite cycle detected");
    return normalized;
  }
  function parse(text) {
    const data = JSON.parse(text);
    const frames = [];
    for (let i = 0; i < text.length; i++) {
      if (text[i] === "{") frames.push(new Set());
      else if (text[i] === "}") frames.pop();
      else if (text[i] === '"') {
        const start = i++;
        for (; i < text.length; i++) { if (text[i] === "\\") { i++; continue; } if (text[i] === '"') break; }
        let next = i + 1;
        while (/\s/.test(text[next] || "x")) next++;
        if (text[next] === ":" && frames.length) {
          const key = JSON.parse(text.slice(start, i + 1));
          if (frames.at(-1).has(key)) throw new Error("Duplicate JSON key: " + key);
          frames.at(-1).add(key);
        }
      }
    }
    return data;
  }
  const api = { code, validate, cycle, validateCatalog, parse };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.CourseData = api;
})(globalThis);
