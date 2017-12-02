import { Model } from '@mean-expert/model';
import * as googleMapsSdk from '@google/maps';

/**
 * @module GooglePlaces
 * @description
 * Google Maps SDK
 **/
@Model({
  hooks: {},
  remotes: {}
})

class GooglePlaces {
  private _sdk: any;
  
    constructor(public model: any) {
        // create shortcut to sdk, as this.model.app.models.GoogleMaps.sdk()
        this.model.sdk = () => this._getSingleton();
    }
  
    private _getSingleton = () => {
        return this._sdk || this._createSdk();
    }
  
    private _createSdk() {
      return this._sdk = googleMapsSdk.createClient({
          key: this.model.app.settings.GOOGLE_API_KEY,
          Promise: Promise
      });
    }  
}

module.exports = GooglePlaces;
