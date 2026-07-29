import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { AuthModalComponent, AuthModalResult, AuthModalMode } from '../../shared/components/auth-modal/auth-modal.component';

@Injectable({
  providedIn: 'root'
})
export class AuthModalService {

  constructor(private dialog: MatDialog) {}

  /**
   * Open the login/register modal popup.
   * Returns an Observable that emits the result when the dialog is closed.
   * The calling component can check `result?.success` to know if auth succeeded.
   */
  open(mode: AuthModalMode = 'login'): Observable<AuthModalResult | undefined> {
    const dialogRef = this.dialog.open(AuthModalComponent, {
      width: 'auto',
      maxWidth: '95vw',
      hasBackdrop: true,
      backdropClass: 'auth-modal-backdrop',
      panelClass: 'auth-modal-panel',
      disableClose: false,
      autoFocus: false,
      data: { mode }
    });

    return dialogRef.afterClosed();
  }
}
