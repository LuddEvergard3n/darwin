/**
 * state.js
 * Darwin — Atlas dos Processos da Vida
 *
 * Estado global da aplicacao.
 * Unica fonte de verdade para dados carregados e estado de UI.
 * Sem dependencias externas.
 */

const State = (() => {
  const STORAGE_KEY = 'darwin_state_v1';
  const defaultProgress = () => ({
    version: 1,
    completedLessons: [],
    completedExercises: [],
    exerciseResults: {},
    lastStudy: null,
  });
  /**
   * Estado interno — nao expor diretamente.
   * Toda mutacao passa por setState().
   */
  let _state = {
    // Dados carregados dos JSONs
    data: {
      axes:         null,
      modules:      null,
      scales:       null,
      concepts:     null,
      processes:    null,
      applications: null,
      glossary:     null,
      exercises:    null,
    },

    // Navegacao atual
    route: {
      current:  null,   // ex: 'home', 'module', 'scale', 'process'
      moduleId: null,   // id do modulo ativo
      lessonId: null,   // id da licao ativa
      scaleId:  null,
    },

    // Estado de UI
    ui: {
      navOpen:          false,
      teacherMode:      false,
      activeScale:      null,
      activeAxis:       null,
      activeProcess:    null,
      glossaryOpen:     false,
      glossaryFilter:   '',
    },

    progress: defaultProgress(),
  };

  /** Listeners registrados por chave de caminho. */
  const _listeners = new Map();

  /**
   * Retorna uma copia rasa do estado para evitar mutacao direta.
   * @returns {object}
   */
  const get = () => ({ ..._state });

  /**
   * Retorna um valor profundo por caminho de ponto.
   * Ex: get('ui.teacherMode'), get('data.modules')
   * @param {string} path
   * @returns {*}
   */
  const getValue = (path) => {
    return path.split('.').reduce((acc, key) => {
      if (acc == null) return undefined;
      return acc[key];
    }, _state);
  };

  /**
   * Atualiza o estado com uma atualizacao parcial profunda.
   * Notifica listeners registrados para o caminho afetado.
   * @param {string} path - caminho de ponto (ex: 'ui.navOpen')
   * @param {*} value
   */
  const set = (path, value) => {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((acc, key) => {
      if (acc[key] == null) {
        acc[key] = {};
      }
      return acc[key];
    }, _state);

    const prev = target[lastKey];
    target[lastKey] = value;

    // Notificar listeners do caminho exato e de caminhos pai
    _notify(path, value, prev);
    if (path.startsWith('progress.') || path === 'ui.teacherMode') _persist();
  };

  /**
   * Atualiza multiplas chaves de uma vez.
   * @param {object} updates - objeto com caminhos de ponto como chaves
   */
  const setMany = (updates) => {
    Object.entries(updates).forEach(([path, value]) => set(path, value));
  };

  /**
   * Registra um listener para mudancas em um caminho especifico.
   * @param {string} path
   * @param {function} callback - (newValue, prevValue) => void
   * @returns {function} unsubscribe
   */
  const subscribe = (path, callback) => {
    if (!_listeners.has(path)) {
      _listeners.set(path, new Set());
    }
    _listeners.get(path).add(callback);

    return () => {
      _listeners.get(path)?.delete(callback);
    };
  };

  /**
   * Notifica todos os listeners registrados para o caminho e seus pais.
   * @param {string} path
   * @param {*} newValue
   * @param {*} prevValue
   */
  const _notify = (path, newValue, prevValue) => {
    const segments = path.split('.');
    for (let i = segments.length; i > 0; i--) {
      const partialPath = segments.slice(0, i).join('.');
      const listeners = _listeners.get(partialPath);
      if (listeners) {
        listeners.forEach(cb => {
          try {
            cb(newValue, prevValue, path);
          } catch (err) {
            console.error(`[State] Erro em listener de '${partialPath}':`, err);
          }
        });
      }
    }
  };

  /**
   * Registra todos os dados JSON carregados de uma vez.
   * @param {object} dataMap - { axes, modules, scales, ... }
   */
  const loadData = (dataMap) => {
    Object.entries(dataMap).forEach(([key, value]) => {
      set(`data.${key}`, value);
    });
  };

  const _safeArray = value => Array.isArray(value) ? [...new Set(value.filter(item => typeof item === 'string'))] : [];
  const _loadProgress = () => {
    if (typeof localStorage === 'undefined') return;
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!stored || stored.version !== 1) return;
      _state.progress = {
        ...defaultProgress(),
        completedLessons: _safeArray(stored.completedLessons),
        completedExercises: _safeArray(stored.completedExercises),
        exerciseResults: stored.exerciseResults && typeof stored.exerciseResults === 'object' ? stored.exerciseResults : {},
        lastStudy: stored.lastStudy && typeof stored.lastStudy === 'object' ? stored.lastStudy : null,
      };
      _state.ui.teacherMode = Boolean(stored.teacherMode);
    } catch (_) {
      // Storage indisponível ou corrompido: manter estado inicial sem apagar dados desconhecidos.
    }
  };
  const _persist = () => {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ..._state.progress, teacherMode: _state.ui.teacherMode }));
    } catch (_) { /* armazenamento privado ou cheio não bloqueia estudo */ }
  };
  const recordExercise = (exerciseId, isCorrect, answer = null) => {
    if (typeof exerciseId !== 'string') return;
    const previous = _state.progress.exerciseResults[exerciseId] ?? { attempts: 0 };
    _state.progress.exerciseResults[exerciseId] = { attempts: previous.attempts + 1, isCorrect: Boolean(isCorrect), answer };
    if (isCorrect && !_state.progress.completedExercises.includes(exerciseId)) _state.progress.completedExercises.push(exerciseId);
    _persist();
    _notify('progress.exerciseResults', _state.progress.exerciseResults, previous);
  };
  const recordLesson = (moduleId, lessonId) => {
    if (!lessonId) return;
    if (!_state.progress.completedLessons.includes(lessonId)) _state.progress.completedLessons.push(lessonId);
    _state.progress.lastStudy = { moduleId, lessonId };
    _persist();
    _notify('progress', _state.progress, null);
  };
  const resetProgress = () => {
    _state.progress = defaultProgress();
    _persist();
    _notify('progress', _state.progress, null);
  };
  _loadProgress();

  return { get, getValue, set, setMany, subscribe, loadData, recordExercise, recordLesson, resetProgress };
})();

export default State;
