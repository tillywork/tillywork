import { AccessControlResourceType } from "@tillywork/shared";
import { AccessControlResource } from "../../services/access.control.service";

export interface AccessStrategy {
    applyAccess(
        resource: AccessControlResource,
        resourceType: AccessControlResourceType
    ): Promise<void>;

    handlePublicAccess?(resource: AccessControlResource): Promise<void>;
    handlePrivateAccess?(resource: AccessControlResource): Promise<void>;

    inheritParentAccess?(resource: AccessControlResource): Promise<void>;
}
