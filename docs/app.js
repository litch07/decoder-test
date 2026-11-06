/**
 * UIU Course Code Decoder — Public Web Catalog & Prerequisite Explorer
 * File: docs/app.js
 *
 * Architecture & Guarantees:
 *  - Strict Zero-innerHTML DOM generation (createElement, textContent, appendChild only).
 *  - High-performance client-side search, filtering, and sorting over 315+ courses.
 *  - Cycle-safe BFS prerequisite chain computation and reverse "unlocks" lookup.
 *  - Interactive Code ↔ Name toggle with localStorage preference persistence.
 *  - Deep URL hash routing (e.g. #CSE-2215 opens that course modal directly).
 *  - Offline-first fallback loading.
 */

(function () {
  'use strict';

  // ── State ────────────────────────────────────────────────────────────────
  let catalog = {};
  let courseKeys = [];
  let currentFilter = {
    query: '',
    dept: 'ALL',
    prereqType: 'ALL',
    sort: 'CODE_ASC'
  };
  let activeModalCourse = null;
  let modalCurriculum = null;
  let showPrereqNames = false; // Code/Name toggle preference

  // ── Department Prefix Categorization ─────────────────────────────────────
  const DEPT_MAP = {
    CSE: new Set(['CSE', 'CST']),
    DS: new Set(['DS']),
    EEE: new Set(['EEE', 'IPE', 'SWL']),
    BBA: new Set(['ACT', 'AIS', 'BAN', 'BDS', 'BUS', 'ECN', 'ECO', 'FIN', 'IBS', 'MGT', 'MIS', 'MKT', 'PMG', 'QNT']),
    SCI: new Set(['MATH', 'MAT', 'PHY', 'CHE', 'BIO']),
    GEN: new Set(['ENG', 'BNG', 'SOC', 'LAW', 'PSY', 'GED', 'BHV', 'FLN', 'URC', 'TEC'])
  };

  function getCoursePrefix(code) {
    return (code || '').split(' ')[0] || '';
  }

  function getCourseDept(code) {
    const prefix = getCoursePrefix(code);
    for (const [dept, prefixSet] of Object.entries(DEPT_MAP)) {
      if (prefixSet.has(prefix)) return dept;
    }
    return 'GEN';
  }

  function getDeptLabel(dept) {
    switch (dept) {
      case 'CSE': return 'CSE';
      case 'DS':  return 'Data Science';
      case 'EEE': return 'EEE';
      case 'BBA': return 'Business';
      case 'SCI': return 'Sciences';
      case 'GEN': return 'General';
      default:    return dept;
    }
  }

  // ── DOM References ───────────────────────────────────────────────────────
  const els = {
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    totalCoursesMetric: document.getElementById('totalCoursesMetric'),
    searchInput: document.getElementById('searchInput'),
    searchClearBtn: document.getElementById('searchClearBtn'),
    deptFilterGroup: document.getElementById('deptFilterGroup'),
    prereqFilterSelect: document.getElementById('prereqFilterSelect'),
    sortSelect: document.getElementById('sortSelect'),
    resultsCountText: document.getElementById('resultsCountText'),
    resetFiltersBtn: document.getElementById('resetFiltersBtn'),
    courseGrid: document.getElementById('courseGrid'),
    loadingState: document.getElementById('loadingState'),
    emptyState: document.getElementById('emptyState'),
    emptyResetBtn: document.getElementById('emptyResetBtn'),

    // Modal
    courseModalOverlay: document.getElementById('courseModalOverlay'),
    courseModalCard: document.getElementById('courseModalCard'),
    modalCloseBtn: document.getElementById('modalCloseBtn'),
    modalCopyLinkBtn: document.getElementById('modalCopyLinkBtn'),
    copyLinkFeedback: document.getElementById('copyLinkFeedback'),
    modalDeptBadge: document.getElementById('modalDeptBadge'),
    modalCourseCode: document.getElementById('modalCourseCode'),
    modalCourseName: document.getElementById('modalCourseName'),
    modalExamSchedule: document.getElementById('modalExamSchedule'),
    modalCreditsPill: document.getElementById('modalCreditsPill'),
    modalCredits: document.getElementById('modalCredits'),
    modalPrereqNotePill: document.getElementById('modalPrereqNotePill'),
    modalPrereqNote: document.getElementById('modalPrereqNote'),
    modalToggleCode: document.getElementById('modalToggleCode'),
    modalToggleName: document.getElementById('modalToggleName'),
    modalChainCount: document.getElementById('modalChainCount'),
    modalChainBody: document.getElementById('modalChainBody'),
    modalUnlocksCount: document.getElementById('modalUnlocksCount'),
    modalUnlocksBody: document.getElementById('modalUnlocksBody'),
    modalReportBtn: document.getElementById('modalReportBtn')
  };

  // ── Data Normalization ───────────────────────────────────────────────────
  function normalizeCourseData(val) {
    if (!val) return { name: "", examDay: "", examSlot: "", prerequisites: [], prerequisiteNote: "", credits: null };
    if (typeof val === "string") {
      return { name: val.trim(), examDay: "", examSlot: "", prerequisites: [], prerequisiteNote: "", credits: null };
    }
    const name = typeof val.name === "string" ? val.name.trim() : "";
    let examDay = typeof val.examDay === "string" ? val.examDay.trim() : "";
    const dayMatch = examDay.match(/^(?:day\s*|d)?([1-9]\d*)$/i);
    examDay = dayMatch ? "Day " + Number(dayMatch[1]) : /^in-class$/i.test(examDay) ? "In-Class" : "";
    const rawSlot = typeof val.examSlot === "string" ? val.examSlot.trim().toUpperCase() : "";
    const examSlot = /^T[123]$/.test(rawSlot) && examDay !== "In-Class" ? rawSlot : "";
    const prerequisiteNote = typeof val.prerequisiteNote === "string" ? val.prerequisiteNote.trim() : "";
    const prerequisites = Array.isArray(val.prerequisites)
      ? [...new Set(val.prerequisites.filter(p => typeof p === "string").map(p => /^none$/i.test(p.trim()) ? "None" : CourseData.code(p)).filter(Boolean))].sort()
      : [];
    let credits = null;
    if (val.credits !== undefined && val.credits !== null && val.credits !== "") {
      const parsed = Number(val.credits);
      if (typeof val.credits !== "boolean" && Number.isFinite(parsed) && parsed > 0) credits = parsed;
    }
    return { name, examDay, examSlot, prerequisites, prerequisiteNote, credits };
  }

  // ── Prerequisite Graph Algorithms ────────────────────────────────────────

  /**
   * Builds a cycle-safe, level-by-level ancestry tree.
   * Direct prerequisites are depth 1; transitive are depth 2+.
   */
  function prerequisiteCatalog(rootCode, catalog) {
    const curriculum = typeof activeModalCourse !== "undefined" && activeModalCourse === rootCode &&
      typeof modalCurriculum !== "undefined" && modalCurriculum ? modalCurriculum : CourseData.code(rootCode).startsWith("DS ") ? "BSDS-233" : "BSCSE-current";
    return CourseData.graph(catalog, {curriculum});
  }

  function buildPrereqChain(rootCode, cat) {
    return prerequisiteCatalog(rootCode, cat).chain(rootCode);
  }

  /**
   * Finds all courses in the catalog that list `code` as a prerequisite.
   */
  function findUnlocks(code, cat) {
    return prerequisiteCatalog(code, cat).unlocks(code);
  }

  // ── UI Rendering: Course Cards Grid ──────────────────────────────────────

  function renderGrid() {
    // Clear grid safely
    while (els.courseGrid.firstChild) {
      els.courseGrid.removeChild(els.courseGrid.firstChild);
    }

    const filteredCodes = getFilteredCourses();

    // Update count text
    const totalCount = courseKeys.length;
    const isFiltered = currentFilter.query || currentFilter.dept !== 'ALL' || currentFilter.prereqType !== 'ALL';
    if (isFiltered) {
      els.resultsCountText.textContent = `Showing ${filteredCodes.length} of ${totalCount} courses`;
      els.resetFiltersBtn.style.display = 'inline-block';
    } else {
      els.resultsCountText.textContent = `Showing all ${totalCount} courses`;
      els.resetFiltersBtn.style.display = 'none';
    }

    if (filteredCodes.length === 0) {
      els.emptyState.style.display = 'block';
      return;
    }
    els.emptyState.style.display = 'none';

    // Build cards fragment
    const frag = document.createDocumentFragment();

    filteredCodes.forEach(code => {
      const data = normalizeCourseData(catalog[code]);
      const dept = getCourseDept(code);

      const card = document.createElement('div');
      card.className = 'course-card';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `${code} - ${data.name}`);

      // Top row: Code + Dept Badge
      const topRow = document.createElement('div');
      topRow.className = 'card-top-row';

      const codeBadge = document.createElement('span');
      codeBadge.className = 'course-code-badge';
      codeBadge.textContent = code;

      const deptBadge = document.createElement('span');
      deptBadge.className = `dept-badge dept-${dept.toLowerCase()}`;
      deptBadge.textContent = getDeptLabel(dept);

      topRow.appendChild(codeBadge);
      topRow.appendChild(deptBadge);

      // Title
      const title = document.createElement('h3');
      title.className = 'course-card-title';
      title.textContent = data.name || 'Untitled Course';

      // Chips row
      const chipsRow = document.createElement('div');
      chipsRow.className = 'card-chips-row';

      // Routine chip (if scheduled)
      if (data.examDay || data.examSlot) {
        const routineChip = document.createElement('span');
        routineChip.className = 'routine-chip';
        routineChip.textContent = `${data.examDay || '—'} • ${data.examSlot || '—'}`;
        chipsRow.appendChild(routineChip);
      }

      // Credits chip
      if (data.credits) {
        const creditChip = document.createElement('span');
        creditChip.className = 'routine-chip';
        creditChip.textContent = `${data.credits} Cr`;
        chipsRow.appendChild(creditChip);
      }

      // Prerequisites count chip
      const prereqsCount = data.prerequisites ? data.prerequisites.length : 0;
      if (prereqsCount > 0) {
        const prereqChip = document.createElement('span');
        prereqChip.className = 'count-chip prereq-count';
        prereqChip.textContent = `${prereqsCount} Prereq${prereqsCount > 1 ? 's' : ''}`;
        chipsRow.appendChild(prereqChip);
      }

      // Unlocks chip
      const unlocks = findUnlocks(code, catalog);
      if (unlocks.length > 0) {
        const unlocksChip = document.createElement('span');
        unlocksChip.className = 'count-chip unlocks-count';
        unlocksChip.textContent = `Unlocks ${unlocks.length}`;
        chipsRow.appendChild(unlocksChip);
      }

      card.appendChild(topRow);
      card.appendChild(title);
      if (chipsRow.children.length > 0) {
        card.appendChild(chipsRow);
      }

      // Click to open inspector
      card.addEventListener('click', () => openCourseModal(code));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openCourseModal(code);
        }
      });

      frag.appendChild(card);
    });

    els.courseGrid.appendChild(frag);
  }

  // ── Filter & Search Logic ────────────────────────────────────────────────

  function getFilteredCourses() {
    const query = currentFilter.query.toLowerCase().trim();
    const dept = currentFilter.dept;
    const prereqType = currentFilter.prereqType;
    const sort = currentFilter.sort;

    let list = courseKeys.filter(code => {
      const data = normalizeCourseData(catalog[code]);

      // Query match (code, name, exam routine)
      if (query) {
        const codeMatch = code.toLowerCase().includes(query);
        const nameMatch = data.name.toLowerCase().includes(query);
        const dayMatch  = data.examDay.toLowerCase().includes(query);
        const slotMatch = data.examSlot.toLowerCase().includes(query);
        const prereqMatch = data.prerequisites.some(p => p.toLowerCase().includes(query));
        if (!codeMatch && !nameMatch && !dayMatch && !slotMatch && !prereqMatch) {
          return false;
        }
      }

      // Department filter
      if (dept !== 'ALL') {
        const cDept = getCourseDept(code);
        if (cDept !== dept) return false;
      }

      // Prerequisite type filter
      if (prereqType === 'HAS_PREREQS') {
        if (!data.prerequisites || data.prerequisites.length === 0) return false;
      } else if (prereqType === 'UNLOCKS_OTHERS') {
        const unlocks = findUnlocks(code, catalog);
        if (unlocks.length === 0) return false;
      } else if (prereqType === 'FOUNDATIONAL') {
        if (data.prerequisites && data.prerequisites.length > 0) return false;
      }

      return true;
    });

    // Sort
    list.sort((a, b) => {
      const dataA = normalizeCourseData(catalog[a]);
      const dataB = normalizeCourseData(catalog[b]);

      if (sort === 'CODE_ASC') {
        return a.localeCompare(b);
      } else if (sort === 'CODE_DESC') {
        return b.localeCompare(a);
      } else if (sort === 'NAME_ASC') {
        return (dataA.name || '').localeCompare(dataB.name || '');
      } else if (sort === 'MOST_PREREQS') {
        const pA = dataA.prerequisites ? dataA.prerequisites.length : 0;
        const pB = dataB.prerequisites ? dataB.prerequisites.length : 0;
        return pB - pA || a.localeCompare(b);
      } else if (sort === 'MOST_UNLOCKS') {
        const uA = findUnlocks(a, catalog).length;
        const uB = findUnlocks(b, catalog).length;
        return uB - uA || a.localeCompare(b);
      }
      return 0;
    });

    return list;
  }

  function updateDepartmentPillCounts() {
    const counts = { ALL: 0, CSE: 0, DS: 0, EEE: 0, BBA: 0, SCI: 0, GEN: 0 };
    courseKeys.forEach(code => {
      counts.ALL++;
      const d = getCourseDept(code);
      if (counts[d] !== undefined) counts[d]++;
    });

    const setBadge = (id, count) => {
      const el = document.getElementById(id);
      if (el) el.textContent = String(count);
    };

    setBadge('countAll', counts.ALL);
    setBadge('countCSE', counts.CSE);
    setBadge('countDS',  counts.DS);
    setBadge('countEEE', counts.EEE);
    setBadge('countBBA', counts.BBA);
    setBadge('countSCI', counts.SCI);
    setBadge('countGEN', counts.GEN);
  }

  // ── Course Inspector Modal ───────────────────────────────────────────────

  function openCourseModal(code, preserveCurriculum = false) {
    if (!catalog[code]) return;
    if (!preserveCurriculum || !modalCurriculum) modalCurriculum = code.startsWith("DS ") ? "BSDS-233" : "BSCSE-current";
    activeModalCourse = code;
    const data = normalizeCourseData(catalog[code]);
    const dept = getCourseDept(code);

    // Update URL hash for direct deep-linking
    const hash = '#' + encodeURIComponent(code.replace(/\s+/g, '-'));
    if (window.location.hash !== hash) {
      history.replaceState(null, '', hash);
    }

    // Modal Header
    els.modalDeptBadge.textContent = getDeptLabel(dept);
    els.modalCourseCode.textContent = code;
    els.modalCourseName.textContent = data.name || 'Untitled Course';

    // Exam Schedule & Notes
    const hasExam = data.examDay || data.examSlot;
    els.modalExamSchedule.textContent = hasExam
      ? `${data.examDay || '—'} • ${data.examSlot || '—'}`
      : 'No Exam Routine Specified';

    if (data.credits) {
      if (els.modalCreditsPill) els.modalCreditsPill.style.display = 'flex';
      if (els.modalCredits) els.modalCredits.textContent = `${data.credits} Credits`;
    } else {
      if (els.modalCreditsPill) els.modalCreditsPill.style.display = 'none';
    }

    const reachable = new Set([code, ...buildPrereqChain(code, catalog).levels.flatMap(level => level.codes)]);
    const review = CourseData.audit(catalog, {curriculum: prerequisiteCatalog(code, catalog).curriculum}).filter(issue => reachable.has(issue.code)).map(issue => issue.message);
    const prerequisiteNote = [modalCurriculum === "BSDS-233" && !code.startsWith("DS ") ? "Roadmap uses the BSDS 233 curriculum." : "", data.prerequisiteNote, ...new Set(review)].filter(Boolean).join(" · ");
    if (prerequisiteNote) {
      els.modalPrereqNotePill.style.display = 'flex';
      els.modalPrereqNote.textContent = prerequisiteNote;
    } else {
      els.modalPrereqNotePill.style.display = 'none';
    }

    // Sync toggle button visual state
    els.modalToggleCode.classList.toggle('is-active', !showPrereqNames);
    els.modalToggleCode.setAttribute('aria-pressed', String(!showPrereqNames));
    els.modalToggleName.classList.toggle('is-active', showPrereqNames);
    els.modalToggleName.setAttribute('aria-pressed', String(showPrereqNames));

    // Render Prereq Chain and Unlocks
    renderModalTrees(code);

    // Update GitHub issue report prefill link
    const report = buildCourseReport("correction", code, data);
    els.modalReportBtn.href = "https://github.com/litch07/uiu-course-decoder/issues/new?title=" + encodeURIComponent(report.title)
      + "&body=" + encodeURIComponent(report.body) + "&labels=" + encodeURIComponent(report.labels);

    // Reset copy feedback
    els.copyLinkFeedback.textContent = 'Share Link';

    // Show modal
    els.courseModalOverlay.style.display = 'flex';
    els.courseModalOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeCourseModal() {
    activeModalCourse = null;
    els.courseModalOverlay.style.display = 'none';
    els.courseModalOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    // Clear hash cleanly
    if (window.location.hash) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }

  /**
   * Helper to format badge label and tooltip depending on Code/Name toggle.
   */
  function badgeContent(courseCode) {
    const inCatalog = !!catalog[courseCode];
    if (!inCatalog) {
      return { label: courseCode, tooltip: `${courseCode} — not in catalog`, isNameMode: false };
    }
    const data = normalizeCourseData(catalog[courseCode]);
    const name = data.name || '';
    if (showPrereqNames && name) {
      return { label: name, tooltip: courseCode, isNameMode: true };
    }
    return { label: courseCode, tooltip: name || `Inspect ${courseCode}`, isNameMode: false };
  }

  function renderModalTrees(code) {
    const chainBody = els.modalChainBody;
    const unlocksBody = els.modalUnlocksBody;

    // Clear bodies
    while (chainBody.firstChild) chainBody.removeChild(chainBody.firstChild);
    while (unlocksBody.firstChild) unlocksBody.removeChild(unlocksBody.firstChild);

    const chain = buildPrereqChain(code, catalog);
    const unlocks = findUnlocks(code, catalog);

    const hasChain = chain.levels.length > 0 || chain.directCodes.length > 0;
    const hasUnlocks = unlocks.length > 0;

    let totalChainCodes = 0;
    chain.levels.forEach(l => { totalChainCodes += l.codes.length; });
    els.modalChainCount.textContent = String(totalChainCodes);
    els.modalUnlocksCount.textContent = String(unlocks.length);

    // ── Render Prerequisite Chain ──────────────────────────────────────────
    if (!hasChain) {
      const emptySpan = document.createElement('span');
      emptySpan.className = 'prereq-empty';
      emptySpan.textContent = 'No prerequisites required for this course (Foundational)';
      chainBody.appendChild(emptySpan);
    } else {
      chain.levels.forEach((level, idx) => {
        // Arrow separator between levels
        if (idx > 0) {
          const arrowEl = document.createElement('span');
          arrowEl.className = 'prereq-chain-arrow';
          arrowEl.setAttribute('aria-hidden', 'true');
          arrowEl.textContent = '›';
          chainBody.appendChild(arrowEl);
        }

        // Depth chip
        const depthLabel = document.createElement('span');
        depthLabel.className = 'prereq-depth-label';
        depthLabel.textContent = idx === 0 ? 'Direct' : `L${level.depth}`;
        chainBody.appendChild(depthLabel);

        // Badges for this depth
        level.codes.forEach(prereqCode => {
          const inCatalog = !!catalog[prereqCode];
          const isDirect = idx === 0;
          const content = badgeContent(prereqCode);

          const badge = document.createElement('button');
          badge.type = 'button';
          badge.className = 'prereq-badge' +
            (inCatalog ? (isDirect ? ' is-direct' : ' is-indirect') : ' is-missing') +
            (content.isNameMode ? ' is-name-mode' : '');
          badge.textContent = content.label;
          badge.title = content.tooltip;

          if (inCatalog) {
            badge.addEventListener('click', () => openCourseModal(prereqCode, true));
          } else {
            badge.setAttribute('aria-disabled', 'true');
          }

          chainBody.appendChild(badge);
        });
      });
    }

    // ── Render Unlocks ─────────────────────────────────────────────────────
    if (!hasUnlocks) {
      const emptyUnlocks = document.createElement('span');
      emptyUnlocks.className = 'prereq-empty';
      emptyUnlocks.textContent = 'This course is not listed as a prerequisite for other catalog courses.';
      unlocksBody.appendChild(emptyUnlocks);
    } else {
      unlocks.forEach(unlockCode => {
        const content = badgeContent(unlockCode);

        const badge = document.createElement('button');
        badge.type = 'button';
        badge.className = 'prereq-badge is-direct' + (content.isNameMode ? ' is-name-mode' : '');
        badge.textContent = content.label;
        badge.title = content.tooltip;
        badge.addEventListener('click', () => openCourseModal(unlockCode, true));

        unlocksBody.appendChild(badge);
      });
    }
  }

  // ── Shareable Link Generator ─────────────────────────────────────────────

  function copyCourseShareLink() {
    if (!activeModalCourse) return;
    const url = window.location.origin + window.location.pathname + '#' + encodeURIComponent(activeModalCourse.replace(/\s+/g, '-'));

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        els.copyLinkFeedback.textContent = 'Copied Link!';
        setTimeout(() => { els.copyLinkFeedback.textContent = 'Share Link'; }, 2000);
      }).catch(() => fallbackCopy(url));
    } else {
      fallbackCopy(url);
    }
  }

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      els.copyLinkFeedback.textContent = 'Copied Link!';
      setTimeout(() => { els.copyLinkFeedback.textContent = 'Share Link'; }, 2000);
    } catch (e) {
      els.copyLinkFeedback.textContent = 'Copy Failed';
    }
    document.body.removeChild(ta);
  }

  // ── Theme Management ─────────────────────────────────────────────────────

  function initTheme() {
    const stored = localStorage.getItem('uiu_theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = stored || (prefersDark ? 'dark' : 'light');
    setTheme(theme);
  }

  function setTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('uiu_theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('uiu_theme', 'light');
    }
  }

  function toggleTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    setTheme(isDark ? 'light' : 'dark');
  }

  // ── Event Listeners Setup ────────────────────────────────────────────────

  function setupEvents() {
    // Theme toggle
    els.themeToggleBtn.addEventListener('click', toggleTheme);

    // Search input
    els.searchInput.addEventListener('input', () => {
      currentFilter.query = els.searchInput.value;
      els.searchClearBtn.style.display = currentFilter.query ? 'flex' : 'none';
      renderGrid();
    });

    els.searchClearBtn.addEventListener('click', () => {
      els.searchInput.value = '';
      currentFilter.query = '';
      els.searchClearBtn.style.display = 'none';
      els.searchInput.focus();
      renderGrid();
    });

    // Department pills
    els.deptFilterGroup.addEventListener('click', (e) => {
      const pill = e.target.closest('.dept-pill');
      if (!pill) return;
      const dept = pill.getAttribute('data-dept');
      if (!dept) return;

      els.deptFilterGroup.querySelectorAll('.dept-pill').forEach(btn => {
        btn.classList.remove('is-active');
        btn.setAttribute('aria-checked', 'false');
      });
      pill.classList.add('is-active');
      pill.setAttribute('aria-checked', 'true');

      currentFilter.dept = dept;
      renderGrid();
    });

    // Secondary filters
    els.prereqFilterSelect.addEventListener('change', () => {
      currentFilter.prereqType = els.prereqFilterSelect.value;
      renderGrid();
    });

    els.sortSelect.addEventListener('change', () => {
      currentFilter.sort = els.sortSelect.value;
      renderGrid();
    });

    // Reset filters buttons
    const resetAll = () => {
      currentFilter.query = '';
      currentFilter.dept = 'ALL';
      currentFilter.prereqType = 'ALL';
      currentFilter.sort = 'CODE_ASC';

      els.searchInput.value = '';
      els.searchClearBtn.style.display = 'none';
      els.prereqFilterSelect.value = 'ALL';
      els.sortSelect.value = 'CODE_ASC';

      els.deptFilterGroup.querySelectorAll('.dept-pill').forEach(btn => {
        const isAll = btn.getAttribute('data-dept') === 'ALL';
        btn.classList.toggle('is-active', isAll);
        btn.setAttribute('aria-checked', String(isAll));
      });

      renderGrid();
    };

    els.resetFiltersBtn.addEventListener('click', resetAll);
    els.emptyResetBtn.addEventListener('click', resetAll);

    // Modal controls
    els.modalCloseBtn.addEventListener('click', closeCourseModal);
    els.courseModalOverlay.addEventListener('click', (e) => {
      if (e.target === els.courseModalOverlay) closeCourseModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && activeModalCourse) {
        closeCourseModal();
      }
    });

    // Copy link
    els.modalCopyLinkBtn.addEventListener('click', copyCourseShareLink);

    // Modal Code/Name toggle
    const activateToggle = (nameMode) => {
      showPrereqNames = nameMode;
      localStorage.setItem('uiu_prereq_names', String(nameMode));
      els.modalToggleCode.classList.toggle('is-active', !nameMode);
      els.modalToggleCode.setAttribute('aria-pressed', String(!nameMode));
      els.modalToggleName.classList.toggle('is-active', nameMode);
      els.modalToggleName.setAttribute('aria-pressed', String(nameMode));
      if (activeModalCourse) renderModalTrees(activeModalCourse);
    };

    els.modalToggleCode.addEventListener('click', () => activateToggle(false));
    els.modalToggleName.addEventListener('click', () => activateToggle(true));

    // Listen for hash change in address bar
    window.addEventListener('hashchange', checkUrlHash);
  }

  // ── URL Hash Deep-Linking ────────────────────────────────────────────────

  function checkUrlHash() {
    const hash = window.location.hash.replace(/^#/, '');
    if (!hash) {
      if (activeModalCourse) closeCourseModal();
      return;
    }
    // Match code format (e.g. CSE-2215 -> CSE 2215)
    const normalizedCode = CourseData.code(decodeURIComponent(hash).replace(/-/g, ' '));
    if (catalog[normalizedCode]) {
      if (activeModalCourse === normalizedCode) return;
      openCourseModal(normalizedCode);
    }
  }

  // ── Init & Catalog Fetching ──────────────────────────────────────────────

  async function init() {
    initTheme();
    setupEvents();

    // Restore Name/Code toggle preference
    const savedNamePref = localStorage.getItem('uiu_prereq_names');
    if (savedNamePref === 'true') {
      showPrereqNames = true;
    }

    // Attempt fetching courses.json (first ./courses.json, then fallback to ../courses.json)
    try {
      let res;
      try {
        res = await fetch('./courses.json');
      } catch (err) {
        res = await fetch('../courses.json');
      }

      if (!res.ok) throw new Error('HTTP ' + res.status);
      catalog = await res.json();
    } catch (e) {
      console.warn('Could not fetch courses.json asynchronously; checking for embedded catalog.', e);
      // If run via local file:// protocol with CORS restrictions, fall back to window.__UIU_COURSES__
      if (window.__UIU_COURSES__ && typeof window.__UIU_COURSES__ === 'object') {
        catalog = window.__UIU_COURSES__;
      } else {
        els.loadingState.textContent = 'Failed to load course database. Please ensure courses.json is accessible.';
        return;
      }
    }

    catalog = CourseData.normalizeMap(catalog);
    courseKeys = Object.keys(catalog).sort();

    // Hide loader
    if (els.loadingState) els.loadingState.style.display = 'none';

    // Update total metric
    if (els.totalCoursesMetric) {
      els.totalCoursesMetric.textContent = `${courseKeys.length}+`;
    }

    // Populate counts and initial grid
    updateDepartmentPillCounts();
    renderGrid();

    // Check if initial load arrived with a hash link (e.g. #CSE-2215)
    checkUrlHash();
  }

  // Launch when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


// Keep report wording aligned with the extension popup.
  function buildCourseReport(kind, code = "", course = null, baseline = null) {
    const addition = kind === "addition" || kind === "missing";
    const proposed = kind === "update";
    const record = typeof course === "string" ? { name: course } : (course || {});
    // Keep course text on one Markdown line; do not let user input create sections.
    const clean = value => String(value ?? "").replace(/[\r\n]+/g, " ")
      .replace(/([\\`*_{}\[\]<>|])/g, "\\$1").trim();
    const titleCode = String(code).replace(/[\r\n]+/g, " ").trim();
    const titleName = String(record.name || "").replace(/[\r\n]+/g, " ").trim();
    const prefix = addition ? "Course addition" : "Course correction";
    const title = kind === "missing" ? "[Missing course] Enter course code and name"
      : `[${prefix}] ${titleCode || "Enter course code"}${titleName ? " — " + titleName : ""}`;
    let routine = "Not listed";
    const day = String(record.examDay || "").trim();
    const slot = String(record.examSlot || "").trim();
    if (/^in-class$/i.test(day)) routine = "In-class evaluation";
    else if (day || slot) {
      const dayNumber = day.match(/^(?:day\s*|d)(\d+)$/i);
      routine = [dayNumber ? "Day " + dayNumber[1] : day, slot].filter(Boolean).join(" · ");
    }
    const prereqs = Array.isArray(record.prerequisites) ? record.prerequisites.filter(Boolean) : [];
    const prerequisiteText = prereqs.length ? prereqs.join(", ") : "Not listed";
    const lines = [];
    if (proposed) {
      const asRecord = value => typeof value === "string" ? { name: value } : (value || {});
      const fields = value => {
        const item = asRecord(value);
        const dayText = String(item.examDay || "").trim();
        const dayMatch = dayText.match(/^(?:day\s*|d)?(\d+)$/i);
        const dayValue = dayMatch ? "Day " + Number(dayMatch[1]) : /^in-class$/i.test(dayText) ? "In-class evaluation" : dayText;
        const codes = Array.isArray(item.prerequisites) ? [...new Set(item.prerequisites.map(v => String(v).trim().toUpperCase()).filter(Boolean))].sort() : [];
        const credits = Number(item.credits);
        return [
          ["Course name", String(item.name || "").trim()],
          ["Credits", Number.isFinite(credits) && credits > 0 ? String(credits) : ""],
          ["Exam day", dayValue],
          ["Exam slot", /^in-class$/i.test(dayText) ? "" : String(item.examSlot || "").trim().toUpperCase()],
          ["Prerequisites", codes.length === 1 && codes[0] === "NONE" ? "No prerequisites" : codes.join(", ")],
          ["Prerequisite note", String(item.prerequisiteNote || "").trim()]
        ];
      };
      const before = fields(baseline);
      const after = fields(record);
      const changes = after.filter((field, index) => baseline === null || field[1] !== before[index][1]);
      lines.push("## Course", "", "- **Course code:** " + (clean(code) || "Enter course code"),
        "- **Course name:** " + (clean(record.name) || "Not listed"), "", "## Proposed changes", "");
      if (baseline === null) lines.push("Current catalog details are not available for comparison.", "");
      if (changes.length) {
        lines.push("| Field | Current catalog | Your proposed change |", "| --- | --- | --- |");
        for (const [label, value] of changes) {
          const previous = before.find(field => field[0] === label)[1];
          lines.push("| " + label + " | " + (baseline === null ? "Not available" : clean(previous) || "Not listed")
            + " | " + (clean(value) || "Not listed") + " |");
        }
      } else {
        lines.push("Your saved details already match the current shared catalog. No field changes were found.");
      }
      lines.push("", "## Reason for change", "", "Explain why these changes are needed.");
    } else {
      lines.push("## Course details", "",
        "- **Course code:** " + (clean(code) || "Enter course code"),
        "- **Course name:** " + (clean(record.name) || "Enter course name"),
        "- **Credits:** " + (clean(record.credits) || "Not listed"),
        "- **Exam routine:** " + clean(routine),
        "- **Prerequisites:** " + clean(prerequisiteText));
      if (record.prerequisiteNote) lines.push("- **Prerequisite note:** " + clean(record.prerequisiteNote));
      if (addition) lines.push("- **Department / program:** Enter department or program");
      if (!addition) lines.push("", "## What needs changing?", "", "Describe the incorrect or missing information.",
        "", "## Proposed correction", "", "Enter the correct details, if known.");
    }
    lines.push("", "## Source", "", "Add an official syllabus, routine, or UCAM reference. For exam updates, include the trimester/year and routine date.",
      "", "Remove student IDs and other personal information from any screenshots before attaching them.",
      "", "---", "Prepared with UIU Course Code Decoder for the community-maintained catalog.");
    return { title, body: lines.join("\n"), labels: addition ? "course-addition" : "data-correction" };
  }

