"use strict";

var EXPORTED_SYMBOLS = [];

Components.utils.import("chrome://BeQuiet/content/ns.jsm");
Components.utils.import("chrome://BeQuiet/content/preferences/preferences.jsm");

BeQuiet.Menu = new function() {
	
	const prefs = BeQuiet.CurrentPrefs;
	const faviconService = Components.classes["@mozilla.org/browser/favicon-service;1"]
		.getService(Components.interfaces.mozIAsyncFavicons);
	
	let self = this;
	
	self.preparePlayContext = function(event) {
		let menu = event.target;
		let browserDocument = menu.ownerDocument;
		
		for(let item of menu.querySelectorAll(':not([static])'))
			menu.removeChild(item);
		
		let handlerCount = 0;
		for(let handler of BeQuiet.Main.getHandlers())
			if(handler.isActive())
				self.addMenuitem(menu, handler, handlerCount++);
		
		menu.setAttribute('noMediaSites', handlerCount === 0);
		
		let toggleButton = menu.querySelector('#com_sppad_beQuiet_toggleEnabledButton');
		toggleButton.setAttribute('checked', prefs.enablePauseResume);
		
		let idlePauseButton = menu.querySelector('#com_sppad_beQuiet_toggleIdlePauseButton');
		idlePauseButton.setAttribute('checked', prefs.idlePause);
	};
	
	self.cleanupPlayContext = function(event) {
		let menu = event.target;
		
		for(let item of menu.querySelectorAll(':not([static])'))
			menu.removeChild(item);
	};
	
	self.addMenuitem = function(menu, handler) {
		let browser = handler.browser;
		let label = browser.contentTitle || browser.currentURI.asciiSpec;
		let browserDocument = browser.ownerDocument;
		
		let item = browserDocument.createElement('menuitem');
		item.handler = handler;
		
		item.setAttribute('class', 'menuitem-iconic');
		item.setAttribute('label', label);
		item.setAttribute('playing', handler.playing);
		item.setAttribute('tooltip', 'com_sppad_beQuiet_menuSiteCommandTooltip');

		faviconService.getFaviconURLForPage(browser.currentURI, function(icon) {
			let image = handler.playing ? 'chrome://BeQuiet/skin/images/note.svg'
					: icon ? icon.asciiSpec
				    : 'chrome://mozapps/skin/places/defaultFavicon.png';
			
			item.setAttribute('image', image);	
		});
		
		item.addEventListener('command', self.menuitemCommand, false);
		
		menu.appendChild(item);
	};
	
	self.menuitemCommand = function(aEvent) {
		let handler = aEvent.target.handler;
		
		if(aEvent.ctrlKey)
		    handler.switchToTab();
		else if(handler.isPlaying())
			handler.pause();
		else
			handler.play();
	};
};