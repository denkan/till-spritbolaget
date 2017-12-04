import * as appSettings from 'application-settings';
import * as platform from "platform";

declare var GMSServices: any;


export const CONFIG = require('./config.json');

export function init() {

  setAppSettings(CONFIG.appSettings);

  if(platform.isIOS){
    setAppSettings(CONFIG.appSettings.ios);
  }
  if(platform.isAndroid){
    setAppSettings(CONFIG.appSettings.android);
  }
  

  /**
   * Google Maps
   */
  if (platform.isIOS) { 
    GMSServices.provideAPIKey(CONFIG.GOOGLE_API_KEY);
  }
}

function setAppSettings(list: { [key: string]: any }) {
  list = list || {};
  for(let key in list){
    const value = list[key];

    switch(typeof value) {
      case 'string':
        appSettings.setString(key, <string>value);
        break;
      case 'number':
        appSettings.setNumber(key, <number>value);
        break;
      case 'boolean':
        appSettings.setBoolean(key, <boolean>value);
        break;
    }
  }
}

export * from 'application-settings';
