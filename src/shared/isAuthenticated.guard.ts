import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { PlatformRequest } from 'src/lib/types';

export class IsAuthenticated implements CanActivate {
  constructor() {
    //
  }
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return this.checkUserAccess(context);
  }

  private checkUserAccess(context: ExecutionContext) {
    const props = ['userData', 'type', 'apiData'];
    let isAuthenticated = false;

    for (const prop of props) {
      const data = this.getContextData(
        context,
        prop as 'userData' | 'apiData' | 'type',
      );
      if (prop === 'userData') {
        isAuthenticated = !!data && !!data.id;
      } else if (
        prop === 'type' &&
        data.type === 'serviced-client' &&
        data.propertySubscriptionId
      ) {
        isAuthenticated = true;
      } else if (prop === 'apiData') {
        isAuthenticated = !!data;
      }
      if (isAuthenticated) {
        break;
      }
    }

    return isAuthenticated;
  }

  private getContextData(
    context: ExecutionContext,
    dataProp: 'userData' | 'apiData' | 'type',
  ) {
    const req = context.switchToHttp().getRequest() as PlatformRequest;
    const authPayload = req.authPayload;

    // Return undefined if authPayload doesn't exist
    if (!authPayload) {
      return undefined;
    }

    let data = authPayload[dataProp];
    if (dataProp === 'type' && authPayload['type'] === 'serviced-client') {
      data = authPayload;
    }
    return data;
  }
}
