import { Component, Injector, ViewChild } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { IconizTeamMemberListDto, IconizTeamMemberServiceProxy } from '@shared/service-proxies/service-proxies';
import { Paginator } from 'primeng/components/paginator/paginator';
import { Table } from 'primeng/components/table/table';
import { CreateOrEditMemberModalComponent } from './create-or-edit-member-modal.component';
import { LazyLoadEvent } from 'primeng/components/common/lazyloadevent';

@Component({
  templateUrl: './iconiz-team-members.component.html',
  animations: [appModuleAnimation()]
})
export class IconizTeamMembersComponent extends AppComponentBase {

  @ViewChild('createOrEditMemberModal') createOrEditMemberModal: CreateOrEditMemberModalComponent;
  @ViewChild('dataTable') dataTable: Table;
  @ViewChild('paginator') paginator: Paginator;

  username = '';

  constructor(
    injector: Injector,
    private _memberService: IconizTeamMemberServiceProxy
) {
    super(injector);
}

getMembers(event?: LazyLoadEvent): void {
  if (this.primengTableHelper.shouldResetPaging(event)) {
    this.paginator.changePage(0);
}

  this.primengTableHelper.showLoadingIndicator();

  this._memberService.getIconizTeamMembers(
    this.username,
    this.primengTableHelper.getSorting(this.dataTable),
    this.primengTableHelper.getMaxResultCount(this.paginator, event),
    this.primengTableHelper.getSkipCount(this.paginator, event)
  ).subscribe(result => {
      this.primengTableHelper.totalRecordsCount = result.totalCount;
      this.primengTableHelper.records = result.items;
      this.primengTableHelper.hideLoadingIndicator();
  });
}

createMember(): void {
  this.createOrEditMemberModal.show();
}

deleteMember(member: IconizTeamMemberListDto): void {
  this.message.confirm(
      this.l('MemberDeleteWarningMessage', member.name_Chn),
      this.l('AreYouSure'),
      isConfirmed => {
          if (isConfirmed) {
              this._memberService.deleteIconizTeamMember(member.id).subscribe(() => {
                  this.getMembers();
                  this.notify.success(this.l('SuccessfullyDeleted'));
              });
          }
      }
  );
}
}
