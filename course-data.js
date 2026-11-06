// Shared full-code identity, catalog validation, merge and prerequisite graph. Offline and DOM-free.
(function(root) {
  "use strict";
  const codePattern = /^[A-Z]+ [0-9]+[A-Z]*$/;
  function code(value) { return String(value).trim().toUpperCase().replace(/\s+/g, " ").replace(/^([A-Z]+)\s*([0-9]+)\s*([A-Z]*)$/, "$1 $2$3"); }
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
    if (value.prerequisiteVariants != null) {
      if (typeof value.prerequisiteVariants !== "object" || Array.isArray(value.prerequisiteVariants)) return "Invalid prerequisite variants";
      for (const variant of Object.values(value.prerequisiteVariants)) {
        if (!variant || !Array.isArray(variant.prerequisites) || typeof variant.source !== "string" || !variant.source.trim()) return "Curriculum prerequisites require a source";
        const error = validate(key, {name:value.name, prerequisites:variant.prerequisites});
        if (error) return error;
      }
    }
    return null;
  }
  function normalizeMap(catalog) {
    const result = Object.create(null);
    for (const [raw, value] of Object.entries(catalog || {})) {
      const key = code(raw);
      if (Object.hasOwn(result, key)) throw new Error("Duplicate normalized course code: " + key);
      result[key] = value && typeof value === "object" ? { ...value,
        ...(Object.hasOwn(value, "prerequisites") ? {prerequisites: Array.isArray(value.prerequisites) ? value.prerequisites.map(p => /^none$/i.test(String(p).trim()) ? "None" : code(p)) : value.prerequisites} : {})
      } : value;
    }
    return result;
  }
  function graph(catalog, options = {}) {
    const records = normalizeMap(catalog);
    const forward = new Map(), reverse = new Map();
    for (const [key, entry] of Object.entries(records)) {
      const variant = entry?.prerequisiteVariants?.[options.curriculum];
      if (variant && Array.isArray(variant.prerequisites)) records[key] = { ...entry, prerequisites: variant.prerequisites.map(code) };
      const deps = Array.isArray(records[key]?.prerequisites) ? records[key].prerequisites : [];
      forward.set(key, [...new Set(deps.filter(p => !/^none$/i.test(p)))]);
    }
    for (const [key, deps] of forward) for (const dependency of deps) {
      if (!reverse.has(dependency)) reverse.set(dependency, []);
      reverse.get(dependency).push(key);
    }
    function chain(raw) {
      const root = code(raw), directCodes = (forward.get(root) || []).slice();
      const visited = new Set([root]), levels = [];
      let current = directCodes.filter(p => { if (visited.has(p)) return false; visited.add(p); return true; });
      while (current.length) {
        levels.push({ codes: current.slice(), depth: levels.length + 1 });
        const next = [];
        for (const key of current) for (const p of forward.get(key) || []) {
          if (!visited.has(p)) { visited.add(p); next.push(p); }
        }
        current = next;
      }
      return { directCodes, levels };
    }
    return { catalog: records, forward, reverse, chain, curriculum: options.curriculum || "BSCSE-current",
      unlocks: raw => (reverse.get(code(raw)) || []).slice().sort() };
  }
  function cycle(catalog, options = {}) {
    const { forward } = graph(catalog, options), state = new Map();
    function visit(key) {
      if (state.get(key) === 1) return key;
      if (state.get(key) === 2) return null;
      state.set(key, 1);
      for (const dependency of forward.get(key) || []) {
        if (forward.has(dependency)) { const found = visit(dependency); if (found) return found; }
      }
      state.set(key, 2); return null;
    }
    for (const key of forward.keys()) { const found = visit(key); if (found) return found; }
    return null;
  }
  function audit(catalog, options = {}) {
    const records = normalizeMap(catalog), issues = [];
    for (const [key, value] of Object.entries(records)) {
      const error = validate(key, value);
      if (error) issues.push({type:"invalid-record", severity:"error", code:key, message:key + ": " + error});
    }
    const curricula = new Set([options.curriculum || ""]);
    if (!options.curriculum) for (const value of Object.values(records)) {
      for (const name of Object.keys(value?.prerequisiteVariants || {})) curricula.add(name);
    }
    for (const curriculum of curricula) {
      const selected = graph(records, {curriculum}).catalog;
      for (const [key, value] of Object.entries(selected)) {
        if (!options.curriculum && curriculum && !records[key]?.prerequisiteVariants?.[curriculum]) continue;
        const seen = new Set();
        for (const dependency of Array.isArray(value?.prerequisites) ? value.prerequisites : []) {
          if (/^none$/i.test(dependency)) continue;
          let type, severity = "error";
          if (dependency === key) type = "self-dependency";
          else if (seen.has(dependency)) type = "duplicate-edge";
          else if (!Object.hasOwn(selected, dependency)) type = "missing-reference";
          else if (/^(?:CSE|DS) /.test(key) && /^(?:CSE|DS) /.test(dependency) && key.split(" ")[0] !== dependency.split(" ")[0]) {
            type = "cross-program"; severity = "warning";
          }
          if (type) issues.push({ type, severity, code: key, prerequisite: dependency, curriculum,
            message: key + " requires " + dependency + (curriculum ? " [" + curriculum + "]" : "") + ": " +
              ({"self-dependency":"self-dependency", "duplicate-edge":"duplicate prerequisite", "missing-reference":"not in catalog", "cross-program":"cross-program prerequisite; verify curriculum"})[type] });
          seen.add(dependency);
        }
      }
      const found = cycle(records, {curriculum});
      if (found) issues.push({type:"cycle", severity:"error", code:found, curriculum, message:"Prerequisite cycle at " + found + (curriculum ? " [" + curriculum + "]" : "")});
    }
    return issues;
  }
  function validateCatalog(catalog, options = {}) {
    if (!catalog || typeof catalog !== "object" || Array.isArray(catalog)) throw new Error("Catalog must be a JSON object");
    const normalized = normalizeMap(catalog);
    for (const [key, value] of Object.entries(catalog)) {
      const error = validate(key, value);
      if (error) throw new Error(key + ": " + error);
    }
    const error = audit(normalized).find(issue => issue.severity === "error" && !(options.allowMissing && issue.type === "missing-reference"));
    if (error) throw new Error(error.type === "cycle" ? "Prerequisite cycle detected" : error.message);
    return normalized;
  }
  function variantSignature(value) {
    return JSON.stringify(Object.entries(value?.prerequisiteVariants || {}).sort(([a], [b]) => a.localeCompare(b))
      .map(([name, entry]) => [name, (Array.isArray(entry?.prerequisites) ? entry.prerequisites : []).map(code).sort(), String(entry?.source || "").trim()]));
  }
  function mergeEntry(base, override) {
    const inherited = typeof base === "string" ? {name:base} : (base || {});
    if (typeof override === "string") return {...inherited, name:override};
    const result = {...inherited, ...(override || {})};
    // Explicit local/remote prerequisites must not silently inherit another curriculum's variants.
    if (override && Object.hasOwn(override, "prerequisites") && !Object.hasOwn(override, "prerequisiteVariants") &&
      JSON.stringify((Array.isArray(override.prerequisites) ? override.prerequisites : []).map(code).sort()) !== JSON.stringify((Array.isArray(inherited.prerequisites) ? inherited.prerequisites : []).map(code).sort())) delete result.prerequisiteVariants;
    return result;
  }
  function mergeCatalog(bundled, remote = {}, user = {}, soft = [], hard = []) {
    const merged = normalizeMap(bundled);
    for (const layer of [normalizeMap(remote), normalizeMap(user)]) for (const [key, value] of Object.entries(layer)) {
      merged[key] = mergeEntry(merged[key], value);
    }
    for (const raw of [...soft, ...hard]) delete merged[code(raw)];
    return merged;
  }
  function overrideIssues(bundled, remote = {}, user = {}) {
    const base = normalizeMap(bundled), official = mergeCatalog(base, remote), issues = [];
    for (const [source, layer, baseline] of [["remoteCourses", remote, base], ["userCourses", user, official]]) {
      for (const [key, value] of Object.entries(normalizeMap(layer))) {
        if (!value || typeof value !== "object" || (!Object.hasOwn(value, "prerequisites") && !Object.hasOwn(value, "prerequisiteVariants")) || !baseline[key]) continue;
        const list = item => JSON.stringify((Array.isArray(item?.prerequisites) ? item.prerequisites : []).map(code).sort());
        if (list(mergeEntry(baseline[key], value)) !== list(baseline[key]) || variantSignature(mergeEntry(baseline[key], value)) !== variantSignature(baseline[key])) issues.push({type:"prerequisite-override", severity:"warning", code:key, source,
          message:key + ": " + source + " prerequisites differ from the catalog; review saved details (they may be intentional)."});
      }
    }
    return issues;
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
  const api = { code, validate, normalizeMap, graph, audit, cycle, validateCatalog, mergeEntry, mergeCatalog, overrideIssues, variantSignature, parse };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.CourseData = api;
})(globalThis);
