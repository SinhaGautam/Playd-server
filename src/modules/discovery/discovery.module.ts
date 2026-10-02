import type {Express} from 'express';
import {BaseModule} from '../../common/modules/base.module.js';
import {DiscoveryController} from './discovery.controller.js';
import {DiscoveryRepository} from './discovery.repository.js';
import {DiscoveryService} from './discovery.service.js';
import {discoveryRouter} from './discovery.routes.js';
export class DiscoveryModule extends BaseModule{
  public register(app:Express):void{app.use(discoveryRouter(new DiscoveryController(new DiscoveryService(new DiscoveryRepository()))));}
}