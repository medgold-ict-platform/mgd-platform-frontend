/***********************************************************
 * PUBLIC API
**********************************************************/
import * as common from './common';

export default class client {

  static useAPI() {
    common.setURL("https://api.med-gold.eu/")
  }

  /********************
    DATASETS
  ********************/
  static datasets() {
    this.useAPI();
    return common.api(`datasets`, 'GET', {});
  }

  static datasetInfo(dataset_id) {
    this.useAPI();
    return common.api(`dataset/${dataset_id}/info`, 'GET', {});
  }

  static datasetWorkflows(dataset_id){
    this.useAPI();
    return common.api(`dataset/${dataset_id}/wfs`, 'GET', {});
  }
}