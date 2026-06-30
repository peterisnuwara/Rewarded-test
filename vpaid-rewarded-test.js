/**
 * Custom VPAID 2.0 Test Creative for Web Rewarded Ads
 * Simulates a display banner inside a video (1x1v) line item slot.
 */
var VpaidAnid = function() {
    this._slot = null;
    this._videoSlot = null;
    this._attributes = {
        'width' : 0,
        'height' : 0,
        'duration' : 10, // Simulated ad length in seconds
        'viewable' : true
    };
    this._eventsMap = {};
};

VpaidAnid.prototype.initAd = function(width, height, viewMode, desiredBitrate, creativeData, environmentVars) {
    this._slot = environmentVars.slot;
    this._videoSlot = environmentVars.videoSlot;
    this.log("VPAID Initialized");
    this.callEvent('AdLoaded');
};

VpaidAnid.prototype.startAd = function() {
    this.log("VPAID Started");
    
    // 1. Create a beautiful display HTML banner canvas
    var canvas = document.createElement('div');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.background = 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)';
    canvas.style.display = 'flex';
    canvas.style.flexDirection = 'column';
    canvas.style.justifyContent = 'center';
    canvas.style.alignItems = 'center';
    canvas.style.color = '#ffffff';
    canvas.style.fontFamily = '"Segoe UI", Roboto, Helvetica, Arial, sans-serif';
    canvas.style.textAlign = 'center';
    canvas.style.padding = '20px';
    canvas.style.boxSizing = 'border-box';
    canvas.id = 'vpaid-test-container';

    // 2. Add structural display elements
    canvas.innerHTML = `
        <h1 style="margin: 0 0 10px 0; font-size: 26px; font-weight: 700;">🎁 House Display Test 🎁</h1>
        <p style="margin: 0 0 15px 0; font-size: 16px; opacity: 0.9;">Simulating a display creative inside a VAST 1x1v slot.</p>
        <div id="vpaid-timer" style="font-size: 14px; background: rgba(0,0,0,0.2); padding: 5px 15px; border-radius: 20px; margin-bottom: 20px;">
            Rewarding in: 10s
        </div>
        <a href="https://example.com" target="_blank" id="vpaid-click" style="padding: 12px 28px; background-color: #ffffff; color: #2575fc; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 14px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); transition: transform 0.2s;">
            Click to Test Tracking
        </a>
    `;

    this._slot.appendChild(canvas);
    this.callEvent('AdImpression');
    this.callEvent('AdVideoStart');

    // 3. Setup click tracking event listener
    var self = this;
    document.getElementById('vpaid-click').addEventListener('click', function() {
        self.callEvent('AdClickThru');
    });

    // 4. Start countdown timer to simulate video progression
    var timeLeft = this._attributes['duration'];
    var timerElement = document.getElementById('vpaid-timer');
    
    var countdown = setInterval(function() {
        timeLeft--;
        if (timerElement) {
            timerElement.innerText = "Rewarding in: " + timeLeft + "s";
        }
        
        // Trigger quartiles for proper tracking reporting
        if (timeLeft === 7) self.callEvent('AdVideoFirstQuartile');
        if (timeLeft === 5) self.callEvent('AdVideoMidpoint');
        if (timeLeft === 2) self.callEvent('AdVideoThirdQuartile');

        if (timeLeft <= 0) {
            clearInterval(countdown);
            self.stopAd();
        }
    }, 1000);
};

VpaidAnid.prototype.stopAd = function() {
    this.log("VPAID Stopping/Completing");
    var element = document.getElementById('vpaid-test-container');
    if (element && element.parentNode) {
        element.parentNode.removeChild(element);
    }
    this.callEvent('AdVideoComplete');
    this.callEvent('AdStopped');
};

// VPAID Technical boilerplate mapping
VpaidAnid.prototype.addEventListener = function(a,b,c) { this._eventsMap[a] = b; };
VpaidAnid.prototype.removeEventListener = function(a) { delete this._eventsMap[a]; };
VpaidAnid.prototype.callEvent = function(eventType) { if (eventType in this._eventsMap) { this._eventsMap[eventType](); } };
VpaidAnid.prototype.handshakeVersion = function(version) { return "2.0"; };
VpaidAnid.prototype.log = function(msg) { console.log("[VPAID Test Ad]: " + msg); };
VpaidAnid.prototype.getAdLinear = function() { return true; };
VpaidAnid.prototype.getAdDuration = function() { return this._attributes['duration']; };
VpaidAnid.prototype.getAdRemainingTime = function() { return this._attributes['duration']; };
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

getVPAIDAd = function() { return new VpaidAnid(); };
