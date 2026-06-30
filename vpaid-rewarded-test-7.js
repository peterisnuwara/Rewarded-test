/**
 * Custom VPAID 2.0 Creative for GAM Web Rewarded Ads - Version 7
 * Fix: implements VPAID 2.0 subscribe/unsubscribe (was addEventListener) so the
 * IMA SDK can receive AdLoaded/AdStarted and actually play the ad.
 */
var VpaidAnid = function() {
    this._slot = null;
    this._videoSlot = null;
    this._eventsMap = {};
    this._duration = 5;
    this._remainingTime = 5;
    this._countdownInterval = null;
    this._attributes = { 'width' : 0, 'height' : 0, 'viewable' : true };
};

VpaidAnid.prototype.initAd = function(width, height, viewMode, desiredBitrate, creativeData, environmentVars) {
    this._slot = environmentVars.slot;
    this._videoSlot = environmentVars.videoSlot;
    this._attributes['width'] = width;
    this._attributes['height'] = height;
    this.callEvent('AdLoaded');
};

VpaidAnid.prototype.startAd = function() {
    var self = this;

    // 1. Inject a dummy video element to fulfill Google's SDK lookup requirements
    if (this._slot) {
        var dummyVideo = document.createElement('video');
        dummyVideo.id = 'vpaid-dummy-video';
        dummyVideo.style.position = 'absolute';
        dummyVideo.style.width = '1px';
        dummyVideo.style.height = '1px';
        dummyVideo.style.opacity = '0.01';
        this._slot.appendChild(dummyVideo);
    }

    // 2. Build the visual container
    var canvas = document.createElement('div');
    canvas.id = 'vpaid-test-container';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.background = 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)';
    canvas.style.display = 'flex';
    canvas.style.flexDirection = 'column';
    canvas.style.justifyContent = 'center';
    canvas.style.alignItems = 'center';
    canvas.style.color = '#ffffff';
    canvas.style.fontFamily = 'Arial, sans-serif';
    canvas.style.boxSizing = 'border-box';

    canvas.innerHTML = `
        <h1 style="margin: 0 0 10px 0; font-size: 24px; font-weight: bold;">⚡ Immediate Test Ad ⚡</h1>
        <p style="margin: 0; font-size: 16px;">Closing automatically in <span id="vpaid-countdown" style="font-weight: bold;">5</span>s...</p>
    `;

    if (this._slot) {
        this._slot.appendChild(canvas);
    }

    this.callEvent('AdImpression');
    this.callEvent('AdVideoStart');

    // 3. 5-Second Autoclose Timer Loop
    var countdownElement = document.getElementById('vpaid-countdown');
    this._countdownInterval = setInterval(function() {
        self._remainingTime--;
        if (countdownElement) {
            countdownElement.innerText = self._remainingTime;
        }
        if (self._remainingTime <= 0) {
            clearInterval(self._countdownInterval);
            self.stopAd();
        }
    }, 1000);
};

VpaidAnid.prototype.stopAd = function() {
    if (this._countdownInterval) clearInterval(this._countdownInterval);

    var canvas = document.getElementById('vpaid-test-container');
    if (canvas && canvas.parentNode) { canvas.parentNode.removeChild(canvas); }

    var video = document.getElementById('vpaid-dummy-video');
    if (video && video.parentNode) { video.parentNode.removeChild(video); }

    // AdVideoComplete is what grants the reward in GAM.
    this.callEvent('AdVideoComplete');
    this.callEvent('AdStopped');
};

// ===== THE FIX: VPAID 2.0 requires subscribe/unsubscribe (NOT addEventListener) =====
// Note: callback is the FIRST arg, event name SECOND — opposite of addEventListener.
VpaidAnid.prototype.subscribe = function(callback, eventName, context) {
    this._eventsMap[eventName] = { fn: callback, ctx: context };
};
VpaidAnid.prototype.unsubscribe = function(eventName) {
    delete this._eventsMap[eventName];
};
VpaidAnid.prototype.callEvent = function(eventType, args) {
    if (eventType in this._eventsMap) {
        var sub = this._eventsMap[eventType];
        sub.fn.apply(sub.ctx || null, args || []);
    }
};
// ====================================================================================

VpaidAnid.prototype.handshakeVersion = function(version) { return "2.0"; };
VpaidAnid.prototype.getAdLinear = function() { return true; };
VpaidAnid.prototype.getAdDuration = function() { return this._duration; };
VpaidAnid.prototype.getAdRemainingTime = function() { return this._remainingTime; };
VpaidAnid.prototype.getAdWidth = function() { return this._attributes['width']; };
VpaidAnid.prototype.getAdHeight = function() { return this._attributes['height']; };
VpaidAnid.prototype.getAdVolume = function() { return 0; };
VpaidAnid.prototype.setAdVolume = function(val) {};
VpaidAnid.prototype.resizeAd = function(width, height, viewMode) {};
VpaidAnid.prototype.pauseAd = function() {};
VpaidAnid.prototype.resumeAd = function() {};
VpaidAnid.prototype.expandAd = function() {};
VpaidAnid.prototype.collapseAd = function() {};
VpaidAnid.prototype.skipAd = function() {};
VpaidAnid.prototype.getAdExpanded = function() { return false; };
VpaidAnid.prototype.getAdSkippableState = function() { return false; };
VpaidAnid.prototype.getAdIcons = function() { return false; };
VpaidAnid.prototype.getAdCompanions = function() { return ''; };

// Explicit factory on window (don't rely on implicit globals).
window.getVPAIDAd = function() { return new VpaidAnid(); };
