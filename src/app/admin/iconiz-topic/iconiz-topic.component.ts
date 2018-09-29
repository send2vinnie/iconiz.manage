import { Component, Injector, ViewChild } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { IconizTopicEditDto, IconizTopicServiceProxy } from '@shared/service-proxies/service-proxies';
import { Paginator } from 'primeng/components/paginator/paginator';
import { Table } from 'primeng/components/table/table';
import { LazyLoadEvent } from 'primeng/components/common/lazyloadevent';

@Component({
  templateUrl: './iconiz-topic.component.html',
  animations: [appModuleAnimation()]
})
export class IconizTopicComponent extends AppComponentBase {
  constructor(
    injector: Injector,
    private _topicService: IconizTopicServiceProxy
) {
    super(injector);
}
}
