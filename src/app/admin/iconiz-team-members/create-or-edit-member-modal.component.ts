import {AfterViewChecked, Component, ElementRef, EventEmitter, Injector, Output, ViewChild} from '@angular/core';
import {AppComponentBase} from '@shared/common/app-component-base';
import {TeamMemberEditDto, IconizTeamMemberServiceProxy, ProfileServiceProxy} from '@shared/service-proxies/service-proxies';
import {ModalDirective} from 'ngx-bootstrap';
import {finalize} from 'rxjs/operators';
import {FileUploader, FileUploaderOptions} from '@node_modules/ng2-file-upload';
import {AppConsts} from '@shared/AppConsts';
import {IAjaxResponse} from '@abp/abpHttpInterceptor';
import {TokenService} from '@abp/auth/token.service';

@Component({
    selector: 'createOrEditMemberModal',
    templateUrl: './create-or-edit-member-modal.component.html'
})
export class CreateOrEditMemberModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('createOrEditModal') modal: ModalDirective;
    @ViewChild('memberNameChnInput') memberNameChnInput: ElementRef;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    member: TeamMemberEditDto = new TeamMemberEditDto();

    isFree = false;
    profilePicture: string;
    uploader: FileUploader;
    temporaryPictureUrl: string;
    temporaryPictureFileName: string;
    _uploaderOptions: FileUploaderOptions = {};
    maxProfilPictureBytesUserFriendlyValue = 5;

    constructor(
        injector: Injector,
        private _memberService: IconizTeamMemberServiceProxy,
        private _profileService: ProfileServiceProxy,
        private _tokenService: TokenService
    ) {
        super(injector);
    }

    ngAfterViewChecked(): void {
        //Temporary fix for: https://github.com/valor-software/ngx-bootstrap/issues/1508
        $('tabset ul.nav').addClass('m-tabs-line');
        $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
    }

    show(memberId?: number): void {
        this.active = true;
        this.initFileUploader();
        this._memberService.getIconizTeamMemberForEdit(memberId).subscribe(memberResult => {
            this.member = memberResult;
            this.getProfilePicture(memberResult.profilePictureId);
            this.modal.show();
        });
    }

    onShown(): void {
        $(this.memberNameChnInput.nativeElement).focus();
    }

    save(): void {
        this.saving = true;
        if (this.temporaryPictureFileName) {
            this.member.profilePictureFileName = this.temporaryPictureFileName;
        }
        this._memberService.createOrUpdateIconizTeamMember(this.member)
            .pipe(finalize(() => this.saving = false))
            .subscribe(() => {
                this.notify.info(this.l('SavedSuccessfully'));
                this.close();
                this.modalSave.emit(null);
            });
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }

    getProfilePicture(profilePictureId: string): void {
        if (!profilePictureId) {
            this.profilePicture = this.appRootUrl() + 'assets/common/images/default-profile-picture.png';
        } else {
            this._profileService.getProfilePictureById(profilePictureId).subscribe(result => {

                if (result && result.profilePicture) {
                    this.profilePicture = 'data:image/jpeg;base64,' + result.profilePicture;
                } else {
                    this.profilePicture = this.appRootUrl() + 'assets/common/images/default-profile-picture.png';
                }
            });
        }
    }

    initFileUploader(): void {
        const self = this;
        self.uploader = new FileUploader({ url: AppConsts.remoteServiceBaseUrl + '/Profile/UploadProfilePicture' });
        self._uploaderOptions.autoUpload = true;
        self._uploaderOptions.authToken = 'Bearer ' + self._tokenService.getToken();
        self._uploaderOptions.removeAfterUpload = true;
        self.uploader.onAfterAddingFile = (file) => {
            file.withCredentials = false;
        };

        self.uploader.onSuccessItem = (item, response, status) => {
            const resp = <IAjaxResponse>JSON.parse(response);
            if (resp.success) {
                self.temporaryPictureFileName = resp.result.fileName;
                self.temporaryPictureUrl = AppConsts.remoteServiceBaseUrl + '/Temp/Downloads/' + resp.result.fileName + '?v=' + new Date().valueOf();
                self.profilePicture = self.temporaryPictureUrl;
            } else {
                this.message.error(resp.error.message);
            }
        };

        self.uploader.setOptions(self._uploaderOptions);
    }
}
