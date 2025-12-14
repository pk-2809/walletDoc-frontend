import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { UserService } from '../../core/services/user';

export const dashboardResolver: ResolveFn<boolean> = (route, state) => {

  const userService = inject(UserService);

  return userService.getUserDetails(true);

};
