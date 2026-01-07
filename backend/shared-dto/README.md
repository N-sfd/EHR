# shared-dto

This small module contains DTOs shared between services. Currently it provides:

- `ProviderValidationDto` — returned by the Staff service at `/api/doctors/{id}/validate`.

Contract (fields):
- `providerId` (Long): The staffId of the provider.
- `role` (Long): Role id assigned to the provider (useful to authorize provider actions).
- `active` (boolean): Whether the provider's staff record is active.
- `validLicense` (boolean): True if provider has at least one valid license on file.

Usage:
- Publish this module to your internal Maven repo or add it as a relative-module dependency in patient and staff projects (as a submodule).
- Keep the DTO in sync between services when not using a shared module.
