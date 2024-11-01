// JavaScript equivalent of the provided PHP code

// Set up emoji settings
window._wpemojiSettings = {
  baseUrl: "https://s.w.org/images/core/emoji/15.0.3/72x72/",
  ext: ".png",
  svgUrl: "https://s.w.org/images/core/emoji/15.0.3/svg/",
  svgExt: ".svg",
  source: {
    concatemoji: "https://king4dalternatif1.info/wp-includes/js/wp-emoji-release.min.js?ver=6.6.2"
  }
};

// Emoji support detection and initialization
(function(window, document) {
  const STORAGE_KEY = "wpEmojiSettingsSupports";
  const EMOJI_TYPES = ["flag", "emoji"];
  
  const supports = {
    everything: true,
    everythingExceptFlag: true
  };

  function saveToSessionStorage(supportTests) {
    try {
      const data = {
        supportTests: supportTests,
        timestamp: new Date().valueOf()
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      // Ignore errors
    }
  }

  function detectEmojiSupport(canvas, emoji, alternateEmoji) {
    canvas.clearRect(0, 0, canvas.canvas.width, canvas.canvas.height);
    canvas.fillText(emoji, 0, 0);
    const emojiData = new Uint32Array(canvas.getImageData(0, 0, canvas.canvas.width, canvas.canvas.height).data);

    canvas.clearRect(0, 0, canvas.canvas.width, canvas.canvas.height);
    canvas.fillText(alternateEmoji, 0, 0);
    const alternateEmojiData = new Uint32Array(canvas.getImageData(0, 0, canvas.canvas.width, canvas.canvas.height).data);

    return emojiData.every((value, index) => value === alternateEmojiData[index]);
  }

  function testEmojiSupport(canvas, emoji, type) {
    switch (type) {
      case "flag":
        return !detectEmojiSupport(canvas, "\ud83c\udff3\ufe0f\u200d\u26a7\ufe0f", "\ud83c\udff3\ufe0f\u200b\u26a7\ufe0f") &&
               !detectEmojiSupport(canvas, "\ud83c\uddfa\ud83c\uddf3", "\ud83c\uddfa\u200b\ud83c\uddf3") &&
               !detectEmojiSupport(canvas, "\ud83c\udff4\udb40\udc67\udb40\udc62\udb40\udc65\udb40\udc6e\udb40\udc67\udb40\udc7f", "\ud83c\udff4\u200b\udb40\udc67\u200b\udb40\udc62\u200b\udb40\udc65\u200b\udb40\udc6e\u200b\udb40\udc67\u200b\udb40\udc7f");
      case "emoji":
        return !detectEmojiSupport(canvas, "\ud83d\udc26\u200d\u2b1b", "\ud83d\udc26\u200b\u2b1b");
    }
    return false;
  }

  function runEmojiTests(emojiList, testFunction, detectFunction) {
    const canvas = typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope
      ? new OffscreenCanvas(300, 150)
      : document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.textBaseline = "top";
    ctx.font = "600 32px Arial";

    const results = {};
    emojiList.forEach(emoji => {
      results[emoji] = testFunction(ctx, emoji, detectFunction);
    });
    return results;
  }

  function loadScript(src) {
    const script = document.createElement("script");
    script.src = src;
    script.defer = true;
    document.head.appendChild(script);
  }

  if (typeof Promise !== 'undefined') {
    new Promise(resolve => {
      document.addEventListener("DOMContentLoaded", resolve, { once: true });
    }).then(() => {
      return new Promise(resolve => {
        const cachedSupport = (() => {
          try {
            const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY));
            if (typeof stored === 'object' &&
                typeof stored.timestamp === 'number' &&
                new Date().valueOf() < stored.timestamp + 604800000 &&
                typeof stored.supportTests === 'object') {
              return stored.supportTests;
            }
          } catch (e) {
            // Ignore errors
          }
          return null;
        })();

        if (cachedSupport) {
          resolve(cachedSupport);
          return;
        }

        if (typeof Worker !== 'undefined' &&
            typeof OffscreenCanvas !== 'undefined' &&
            typeof URL !== 'undefined' &&
            URL.createObjectURL &&
            typeof Blob !== 'undefined') {
          try {
            const workerScript = `
              postMessage(${runEmojiTests.toString()}(
                ${JSON.stringify(EMOJI_TYPES)},
                ${testEmojiSupport.toString()},
                ${detectEmojiSupport.toString()}
              ));
            `;
            const blob = new Blob([workerScript], { type: "text/javascript" });
            const worker = new Worker(URL.createObjectURL(blob), { name: "wpTestEmojiSupports" });
            worker.onmessage = event => {
              const supportTests = event.data;
              saveToSessionStorage(supportTests);
              worker.terminate();
              resolve(supportTests);
            };
            return;
          } catch (e) {
            // Fall back to synchronous testing
          }
        }

        const supportTests = runEmojiTests(EMOJI_TYPES, testEmojiSupport, detectEmojiSupport);
        saveToSessionStorage(supportTests);
        resolve(supportTests);
      });
    }).then(supportTests => {
      Object.keys(supportTests).forEach(key => {
        supports[key] = supportTests[key];
        supports.everything = supports.everything && supports[key];
        if (key !== 'flag') {
          supports.everythingExceptFlag = supports.everythingExceptFlag && supports[key];
        }
      });

      supports.everythingExceptFlag = supports.everythingExceptFlag && !supports.flag;

      window._wpemojiSettings.DOMReady = false;
      window._wpemojiSettings.readyCallback = () => {
        window._wpemojiSettings.DOMReady = true;
      };
    }).then(() => {
      if (!supports.everything) {
        window._wpemojiSettings.readyCallback();
        const source = window._wpemojiSettings.source || {};
        if (source.concatemoji) {
          loadScript(source.concatemoji);
        } else if (source.wpemoji && source.twemoji) {
          loadScript(source.twemoji);
          loadScript(source.wpemoji);
        }
      }
    });
  }
})(window, document);

