/**
 * Custom VPAID 2.0 Creative for GAM Web Rewarded Ads
 * Simulates a display banner inside a video (1x1v) line item slot.
 */
var VpaidAnid = function() {
    this._slot = null;
    this._videoSlot = null;
    this._eventsMap = {};
    this._duration = 10; // Ad length in seconds
    this._remainingTime = 10;
    this._countdownInterval = null;
    this._attributes = {
        'width' : 0,
        'height' : 0,
        'viewable' : true
    };
};

VpaidAnid.prototype.initAd = function(width, height, viewMode, desiredBitrate, creativeData, environmentVars) {
    this._slot = environmentVars.slot;
    this._videoSlot = environmentVars.videoSlot;
    this._attributes['width'] = width;
    this._attributes['height'] = height;
    
    this.log("VPAID Initialized");
    this.callEvent('AdLoaded');
};

VpaidAnid.prototype.startAd = function() {
    this.log("VPAID Started");
    var self = this;
    
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
    // Notice we use a <div> acting as a button instead of an <a> tag to avoid double-clicks
    canvas.innerHTML = `
        <h1 style="margin: 0 0 10px 0; font-size: 26px; font-weight: 700;">🎁 House Display Test 🎁</h1>
        <p style="margin: 0 0 15px 0; font-size: 16px; opacity: 0.9;">Simulating a display creative inside a VAST 1x1v slot.</p>
        <div id="vpaid-timer" style="font-size: 14px; background: rgba(0,0,0,0.2); padding: 5px 15px; border-radius: 20px; margin-bottom: 20px;">
            Rewarding in: ${this._duration}s
        </div>
        <div id="vpaid-click" style="cursor: pointer; padding: 12px 28px; background-color: #ffffff; color: #2575fc; border-radius: 50px; font-weight: bold; font-size: 14px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
            Click to Test Tracking
        </div>
    `;

    this._slot.appendChild(canvas);
    this.callEvent('AdImpression');
    this.callEvent('AdVideoStart');

   // 3. Setup click tracking event listener
    document.getElementById('vpaid-click').addEventListener('click', function(e) {
        e.preventDefault();
        
        // Step A: Manually open the destination URL in a new tab safely
        window.open('https://nuwara.io', '_blank');
        
        // Step B: Tell IMA a click happened so GAM registers the metric.
        // Crucial: The third argument is false. This tells IMA NOT to try and 
        // handle the click navigation or touch the media elements, preventing the crash.
        self.callEvent('AdClickThru', ['', '', false]); 
    });

    // 4. Start countdown timer to simulate video progression
    var timerElement = document.getElementById('vpaid-timer');
    
    this._countdownInterval = setInterval(function() {
        self._remainingTime--;
        
        if (timerElement) {
            timerElement.innerText = "Rewarding in: " + self._remainingTime + "s";
        }
        
        // Trigger quartiles for proper tracking reporting
        var percentComplete = (self._duration - self._remainingTime) / self._duration;
        
        if (percentComplete === 0.25) self.callEvent('AdVideoFirstQuartile');
        if (percentComplete === 0.50) self.callEvent('AdVideoMidpoint');
        if (percentComplete === 0.75) self.callEvent('AdVideoThirdQuartile');

        if (self._remainingTime <= 0) {
            clearInterval(self._countdownInterval);
            self.stopAd();
        }
    }, 1000);
};

VpaidAnid.prototype.stopAd = function() {
    this.log("VPAID Stopping/Completing");
    if (this._countdownInterval) clearInterval(this._countdownInterval);
    
    var element = document.getElementById('vpaid-test-container');
    if (element && element.parentNode) {
        element.parentNode.removeChild(element);
    }
    
    // Firing AdVideoComplete is strictly required for GAM to grant the reward!
    this.callEvent('AdVideoComplete');
    this.callEvent('AdStopped');
};

// VPAID Technical boilerplate mapping
VpaidAnid.prototype.addEventListener = function(a,b,c) { this._eventsMap[a] = b; };
VpaidAnid.prototype.removeEventListener = function(a) { delete this._eventsMap[a]; };
// Upgraded callEvent to accept arguments
VpaidAnid.prototype.callEvent = function(eventType, args) { 
    if (eventType in this._eventsMap) { 
        this._eventsMap[eventType].apply(null, args || []); 
    } 
};
VpaidAnid.prototype.handshakeVersion = function(version) { return "2.0"; };
VpaidAnid.prototype.log = function(msg) { console.log("[VPAID Display Ad]: " + msg); };
VpaidAnid.prototype.getAdLinear = function() { return true; };
VpaidAnid.prototype.getAdDuration = function() { return this._duration; };
// CRITICAL FIX: Must return dynamic decreasing time for IMA SDK
VpaidAnid.prototype.getAdRemainingTime = function() { return this._remainingTime; }; 
VpaidAnid.prototype.getAdWidth = function() { return this._attributes['width']; };
VpaidAnid.prototype.getAdHeight = function() { return this._attributes['height']; };
VpaidAnid.prototype.getAdVolume = function() { return 0; };
VpaidAnid.prototype.setAdVolume = function(val) {};
VpaidAnid.prototype.resizeAd = function(width, height, viewMode) {
    this._attributes['width'] = width;
    this._attributes['height'] = height;
};
VpaidAnid.prototype.pauseAd = function() {};
VpaidAnid.prototype.resumeAd = function() {};
VpaidAnid.prototype.expandAd = function() {};
VpaidAnid.prototype.collapseAd = function() {};
VpaidAnid.prototype.skipAd = function() {};

getVPAIDAd = function() { return new VpaidAnid(); };
