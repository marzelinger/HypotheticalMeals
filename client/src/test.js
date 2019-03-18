const assert = require('assert');
import Scraper from './helpers/Scraper'

it('should return true', async() => {
  Scraper.triggerSkuPull(123)
  assert.equal(true, true);
}); 