const CHANNEL_NAME = "hhk_exam_lock";
const STORAGE_KEY = "hhk_active_exam_lock";
const HEARTBEAT_TTL_MS = 1e4;
const EXAM_TAB_ID = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `tab_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
function readActiveLock() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.tabId || !parsed?.ts) return null;
    if (Date.now() - parsed.ts > HEARTBEAT_TTL_MS) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
function requestExamFullscreen() {
  const el = document.documentElement;
  try {
    if (document.fullscreenElement) return;
    if (typeof el.requestFullscreen === "function") {
      void Promise.resolve(el.requestFullscreen()).catch(() => void 0);
    } else if (typeof el.webkitRequestFullscreen === "function") {
      el.webkitRequestFullscreen();
    }
  } catch {
  }
}
function exitExamFullscreen() {
  try {
    if (document.fullscreenElement && typeof document.exitFullscreen === "function") {
      void Promise.resolve(document.exitFullscreen()).catch(() => void 0);
    }
  } catch {
  }
}
function activateExamTabLock(testName, onExternalTabAttempt) {
  const writeHeartbeat = () => {
    try {
      const payload = {
        tabId: EXAM_TAB_ID,
        testName,
        ts: Date.now()
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
    }
  };
  writeHeartbeat();
  const heartbeat = window.setInterval(writeHeartbeat, 3e3);
  let channel = null;
  try {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.postMessage({
      type: "EXAM_LOCK_START",
      tabId: EXAM_TAB_ID,
      testName
    });
    channel.onmessage = (event) => {
      const msg = event.data;
      if (!msg || msg.tabId === EXAM_TAB_ID) return;
      if (msg.type === "EXAM_COMPANION_OPENED") {
        onExternalTabAttempt();
      }
    };
  } catch {
    channel = null;
  }
  return () => {
    window.clearInterval(heartbeat);
    try {
      const current = readActiveLock();
      if (current?.tabId === EXAM_TAB_ID) {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
    }
    try {
      channel?.postMessage({
        type: "EXAM_LOCK_END",
        tabId: EXAM_TAB_ID
      });
      channel?.close();
    } catch {
    }
  };
}
function subscribeCompanionTabLock(onLockedOut) {
  let channel = null;
  const notifyPrimaryAndTryClose = (info) => {
    try {
      channel?.postMessage({
        type: "EXAM_COMPANION_OPENED",
        tabId: EXAM_TAB_ID
      });
    } catch {
    }
    try {
      window.close();
    } catch {
    }
    onLockedOut(info);
  };
  try {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = (event) => {
      const msg = event.data;
      if (!msg || msg.tabId === EXAM_TAB_ID) return;
      if (msg.type === "EXAM_LOCK_START") {
        notifyPrimaryAndTryClose({ testName: msg.testName });
      } else if (msg.type === "EXAM_LOCK_END") {
        onLockedOut(null);
      }
    };
  } catch {
    channel = null;
  }
  const existing = readActiveLock();
  if (existing && existing.tabId !== EXAM_TAB_ID) {
    notifyPrimaryAndTryClose({ testName: existing.testName });
  }
  const onStorage = (event) => {
    if (event.key !== STORAGE_KEY) return;
    if (!event.newValue) {
      onLockedOut(null);
      return;
    }
    const current = readActiveLock();
    if (current && current.tabId !== EXAM_TAB_ID) {
      notifyPrimaryAndTryClose({ testName: current.testName });
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener("storage", onStorage);
    try {
      channel?.close();
    } catch {
    }
  };
}
export {
  EXAM_TAB_ID,
  activateExamTabLock,
  exitExamFullscreen,
  requestExamFullscreen,
  subscribeCompanionTabLock
};
