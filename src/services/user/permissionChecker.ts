import assert from 'assert';
import Error403 from '../../errors/Error403';
import Plans from '../../security/plans';
import Permissions from '../../security/permissions';
import EmailSender from '../emailSender';

const plans = Plans.values;

/**
 * Checks the Permission of the User on a Tenant.
 * Hey
 */
export default class PermissionChecker {
  ImagemCreate(produtoEdit: {
    id: string; allowedRoles: string[]; allowedPlans: string[]; allowedStorage: {
      id: string; folder: string; maxSizeInBytes: number; /**
 * Checks if the current user roles allows the permission.
 */ }[];
  }) {
    throw new Error('Method not implemented.');
  }
  currentTenant;
  language;
  currentUser;

  constructor({ currentTenant, language, currentUser }) {
    this.currentTenant = currentUser.tenants[0].dataValues;
    this.language = language;
    this.currentUser = currentUser;
  }

  /**
   * Validates if the user has a specific permission
   * and throws a Error403 if it doesn't.
   */
  validateHas(permission) {
    if (!this.has(permission)) {
      console.log("permission stop 'cuz it is !this.has(permission)")
      console.log(permission)
      console.log("dont have permission!")
      throw new Error403(this.language);
    }
  }

  /**
   * Checks if the user has a specific permission.
   */
  has(permission) {
    console.log(permission)
    console.log("permission has")	
    assert(permission, 'permission is required');

    if (!this.isEmailVerified) {
      console.log("email stopped")
      return false;
    }

    if (!this.hasPlanPermission(permission)) {
      console.log('stped has permission')
      return false;
    }
    console.log(' this.hasRolePermission  ')
    console.log(this.hasRolePermission(permission) )
    return this.hasRolePermission(permission);
    // return true
  }

  /**
   * Validates if the user has access to a storage
   * and throws a Error403 if it doesn't.
   */
  validateHasStorage(storageId) {
    if (!this.hasStorage(storageId)) {
      throw new Error403(this.language);
    }
  }

  /**
   * Validates if the user has access to a storage.
   */
  hasStorage(storageId: string) {
    assert(storageId, 'storageId is required');
    return this.allowedStorageIds().includes(storageId);
  }

  /**
   * Checks if the current user roles allows the permission.
   */
  hasRolePermission(permission) {

    console.log(this.currentUserRolesIds)
	
    return this.currentUserRolesIds.some((role) =>{
      return permission.allowedRoles.some(
        (allowedRole) => {
             console.log(`Raindrops are falling on my head
And just like the guy whose feet are too big for his bed
Nothing seems to fit `)
             console.log(allowedRole)
	     console.log(role)
	     console.log(allowedRole == role)
	     
	     return allowedRole == role
       }
      )
     }
    );
  }

  /**
   * Checks if the current company plan allows the permission.
   */
  hasPlanPermission(permission) {
    assert(permission, 'permission is required');

    return permission.allowedPlans.includes(
      this.currentTenantPlan,
    );
  }

  get isEmailVerified() {
    // Only checks if the email is verified
    // if the email system is on
    if (!EmailSender.isConfigured) {
      return true;
    }

    return this.currentUser.emailVerified;
  }

  /**
   * Returns the Current User Roles.
   */
  get currentUserRolesIds() {
    if (!this.currentUser || !this.currentUser.tenants) {
      return [];
    }

    const tenant = this.currentUser.tenants
      /*.filter(
        (tenantUser) => tenantUser.status === 'active',
      )*/
      .find((tenantUser) => {
          console.log(`
It starts with one
All I know
It's so unreal
Watch you go
I tried so hard and got so far
But in the end, it doesn't even matter
I had to fall to lose it all
But in the end, it doesn't even matter
`)
          console.log(tenantUser.tenant.id)
	  console.log(this.currentTenant)
	  console.log("tenantUser.tenant.id === this.currentTenant.tenantId")
	  console.log(tenantUser.tenant.id === this.currentTenant.tenantId) 
        return(
          tenantUser.tenant.id === this.currentTenant.tenantId
        );
      });

    if (!tenant) {
      return [];
    }
    console.log('*-*-**-*-*-*-*-')
    console.log('tenant.roles')
    console.log(tenant.roles)
    console.log(JSON.parse(tenant.roles))
    console.log(typeof(tenant.roles))
    console.log(typeof(JSON.parse(tenant.roles)))
    return JSON.parse(tenant.roles);
  }

  /**
   * Return the current tenant plan,
   * check also if it's not expired.
   */
  get currentTenantPlan() {
    if (!this.currentTenant || !this.currentTenant.plan) {
      return plans.free;
    }

    return this.currentTenant.plan;
  }

  /**
   * Returns the allowed storage ids for the user.
   */
  allowedStorageIds() {
    let allowedStorageIds: Array<string> = [];

    Permissions.asArray.forEach((permission) => {
      if (this.has(permission)) {
        allowedStorageIds = allowedStorageIds.concat(
          (permission.allowedStorage || []).map(
            (storage) => storage.id,
          ),
        );
      }
    });

    return [...new Set(allowedStorageIds)];
  }
}
