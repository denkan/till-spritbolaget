import { Model } from '@mean-expert/model';
import { pick, merge } from 'lodash';

/**
 * @module Spritbolag
 * @description
 * Write a useful Spritbolag Model description.
 * Register hooks and remote methods within the
 * Model Decorator
 **/
@Model({
  hooks: {},
  remotes: {
    findNearby: {
      accepts : [
        { arg: 'location', type: 'string', required: true },
        { arg: 'req', type: 'object', http: { source: 'req' } },
      ],
      returns : { root: true, type: 'array' },
      http    : { path: '/find-nearby', verb: 'get' }
    }
  }
})

class Spritbolag {

  constructor(public model: any) {}


  findNearby(location: string, req: any, next: Function): void {
    const searchName = 'Systembolaget'

    const GooglePlacesSdk = this.model.app.models.GooglePlaces.sdk();
    const defaultOptions = {
      keyword: searchName, 
      name: searchName,
      location: location,
      language: 'sv',
      //radius: 100000, // 100 km
      type: 'liquor_store',
      rankby: 'distance',
      //opennow: true,
    };
    const validOptions = pick(req.query, ['nowopen']);
    const searchOptions = merge({}, defaultOptions, validOptions);

    GooglePlacesSdk.placesNearby(searchOptions)
    .asPromise()
    .then(_filterAndCacheData)
    .catch(next);

    function _filterAndCacheData(googleData: any){
      let results = ((googleData.json)||{}).results || [];
      // systembolaget only:
      results = results.filter(r => r.name===searchName);

      next(null, results);
    }
  }
}

module.exports = Spritbolag;
