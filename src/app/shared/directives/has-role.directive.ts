import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { TokenService } from '../../core/services/token.service';

@Directive({
  selector: '[appHasRole]',
  standalone: false
})
export class HasRoleDirective {
  private allowedRoles: string[] = [];
  private hasView = false;

  @Input() set appHasRole(roles: string | string[]) {
    this.allowedRoles = Array.isArray(roles) ? roles : [roles];
    this.updateView();
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private tokenService: TokenService
  ) {}

  private updateView(): void {
    const userRole = this.tokenService.getUserRole();
    const hasRole = userRole !== null && this.allowedRoles.includes(userRole);

    if (hasRole && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasRole && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}