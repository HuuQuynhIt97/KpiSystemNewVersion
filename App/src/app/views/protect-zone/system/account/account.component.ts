import { BaseComponent } from 'src/app/_core/_component/base.component';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertifyService } from 'src/app/_core/_service/alertify.service';
import { EditService, ToolbarService, PageService, GridComponent, QueryCellInfoEventArgs } from '@syncfusion/ej2-angular-grids';
import { Tooltip } from '@syncfusion/ej2-angular-popups';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { Account2Service } from 'src/app/_core/_service/account2.service';
import { Account } from 'src/app/_core/_model/account';
import { MessageConstants } from 'src/app/_core/_constants/system';
import { AccountGroupService } from 'src/app/_core/_service/account.group.service';
import { AccountGroup } from 'src/app/_core/_model/account.group';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
  providers: [ToolbarService, EditService, PageService]
})
export class AccountComponent extends BaseComponent implements OnInit {
  data: Account[] = [];
  password = '';
  modalReference: NgbModalRef;
  fields: object = { text: 'name', value: 'id' };
  // toolbarOptions = ['Search'];
  passwordFake = `aRlG8BBHDYjrood3UqjzRl3FubHFI99nEPCahGtZl9jvkexwlJ`;
  pageSettings = { pageCount: 20, pageSizes: true, pageSize: 10 };
  @ViewChild('grid') public grid: GridComponent;
  accountCreate: Account;
  accountUpdate: Account;
  setFocus: any;
  locale = localStorage.getItem('lang');
  accountGroupData: AccountGroup[];
  accountGroupId: any;
  constructor(
    private service: Account2Service,
    private accountGroupService: AccountGroupService,
    public modalService: NgbModal,
    private alertify: AlertifyService,
    private route: ActivatedRoute,
  ) { super(); }

  ngOnInit() {
    // this.Permission(this.route);
    this.loadData();
    this.loadAccountGroupData();
  }
  // life cycle ejs-grid

  onDoubleClick(args: any): void {
    this.setFocus = args.column; // Get the column from Double click event
  }
  actionBegin(args) {
    if (args.requestType === 'beginEdit') {
      const item = args.rowData;
      this.accountGroupId = item.accountGroupId;
    }
    if (args.requestType === 'save' && args.action === 'add') {
      this.accountCreate = {
        id: 0,
        username: args.data.username ,
        password: args.data.password,
        fullName: args.data.fullName,
        email: args.data.email,
        accountTypeId: 2,
        isLock: false,
        accountGroupId: this.accountGroupId,
        createdBy: 0,
        createdTime: new Date().toLocaleDateString(),
        modifiedBy: 0,
        modifiedTime: null,
        accountGroup: null,
        accountType: null,
      };

      if (args.data.username === undefined) {
        this.alertify.error('Please key in a account! <br> Vui lòng nhập tài khoản đăng nhập!');
        args.cancel = true;
        return;
      }
      if (args.data.password === undefined) {
        this.alertify.error('Please key in a password! <br> Vui lòng nhập mật khẩu!');
        args.cancel = true;
        return;
      }
      this.create();
    }
    if (args.requestType === 'save' && args.action === 'edit') {
      this.accountUpdate = {
        id: args.data.id,
        username: args.data.username ,
        password: args.data.password,
        fullName: args.data.fullName,
        email: args.data.email,
        isLock: args.data.isLock,
        accountTypeId: args.data.accountTypeId,
        accountGroupId: this.accountGroupId,
        createdBy: args.data.createdBy,
        createdTime: args.data.createdTime,
        modifiedBy:args.data.modifiedBy,
        modifiedTime: args.data.modifiedTime,
        accountGroup: null,
        accountType: null,
      };
      this.update();
    }
    if (args.requestType === 'delete') {
      this.delete(args.data[0].id);
    }
  }

  toolbarClick(args) {
    switch (args.item.id) {
      case 'grid_excelexport':
        this.grid.excelExport({ hierarchyExportMode: 'All' });
        break;
      default:
        break;
    }
  }
  actionComplete(args) {
    if (args.requestType === 'add') {
      args.form.elements.namedItem('username').focus(); // Set focus to the Target element
    }
  }

  // end life cycle ejs-grid

  // api

  lock(id): void {
    this.service.lock(id).subscribe(
      (res) => {
        if (res.success === true) {
          const message = res.message;
          this.alertify.success(message);
          this.loadData();
        } else {
           this.alertify.warning(MessageConstants.SYSTEM_ERROR_MSG);
        }
      },
      (err) => this.alertify.warning(MessageConstants.SYSTEM_ERROR_MSG)
    );
  }

  loadData() {
    this.service.getAll().subscribe(data => {
      this.data = data;
    });
  }
  loadAccountGroupData() {
    this.accountGroupService.getAll().subscribe(data => {
      this.accountGroupData = data;
    });
  }
  delete(id) {
    this.service.delete(id).subscribe(
      (res) => {
        if (res.success === true) {
          this.alertify.success(MessageConstants.DELETED_OK_MSG);
          this.loadData();
        } else {
           this.alertify.warning(MessageConstants.SYSTEM_ERROR_MSG);
        }
      },
      (err) => this.alertify.warning(MessageConstants.SYSTEM_ERROR_MSG)
    );

  }
  create() {
    this.service.add(this.accountCreate).subscribe(
      (res) => {
        if (res.success === true) {
          this.alertify.success(MessageConstants.CREATED_OK_MSG);
          this.loadData();
          this.accountCreate = {} as Account;
        } else {
           this.alertify.warning(MessageConstants.SYSTEM_ERROR_MSG);
        }

      },
      (error) => {
        this.alertify.warning(MessageConstants.SYSTEM_ERROR_MSG);
      }
    );
  }
  update() {
    this.service.update(this.accountUpdate).subscribe(
      (res) => {
        if (res.success === true) {
          this.alertify.success(MessageConstants.UPDATED_OK_MSG);
          this.loadData();
        } else {
          this.alertify.warning(MessageConstants.SYSTEM_ERROR_MSG);
        }
      },
      (error) => {
        this.alertify.warning(MessageConstants.SYSTEM_ERROR_MSG);
      }
    );
  }
  // end api
  NO(index) {
    return (this.grid.pageSettings.currentPage - 1) * this.pageSettings.pageSize + Number(index) + 1;
  }
  onChangeAccountGroup(args) {
    console.log(args);
    this.accountGroupId = args.itemData.id;
  }
}
