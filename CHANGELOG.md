## [1.4.1](https://github.com/princjef/irontask/compare/v1.4.0...v1.4.1) (2020-09-16)


### Bug Fixes

* use lastRunTime when re-enabling a task ([#38](https://github.com/princjef/irontask/issues/38)) ([5988585](https://github.com/princjef/irontask/commit/59885858e7c168663a0ef5c8227e900474f162eb))

# [1.4.0](https://github.com/princjef/irontask/compare/v1.3.0...v1.4.0) (2020-09-16)


### Features

* add lastRunTime option on task create ([#37](https://github.com/princjef/irontask/issues/37)) ([6b24c73](https://github.com/princjef/irontask/commit/6b24c73a5fdf3042dfa1b0b373aeb8ea40bd2e82))

# [1.3.0](https://github.com/princjef/irontask/compare/v1.2.0...v1.3.0) (2020-09-16)


### Features

* skip past task occurrences when enabling a disabled task ([#35](https://github.com/princjef/irontask/issues/35)) ([f1a3346](https://github.com/princjef/irontask/commit/f1a334673e02c04db0db3cf1036e8d88b59a6687))

# [1.2.0](https://github.com/princjef/irontask/compare/v1.1.4...v1.2.0) (2020-05-06)


### Features

* **query:** use new offset and limit params for paging ([#33](https://github.com/princjef/irontask/issues/33)) ([d286254](https://github.com/princjef/irontask/commit/d2862547c6c1710745fcd74f9762ef1894e836c9))

## [1.1.4](https://github.com/princjef/irontask/compare/v1.1.3...v1.1.4) (2019-09-10)


### Bug Fixes

* **cosmos:** remove authorization header if present in errors ([#25](https://github.com/princjef/irontask/issues/25)) ([e2baa33](https://github.com/princjef/irontask/commit/e2baa33))

## [1.1.3](https://github.com/princjef/irontask/compare/v1.1.2...v1.1.3) (2019-08-27)


### Bug Fixes

* **cosmos:** disable internal cosmos retries ([#24](https://github.com/princjef/irontask/issues/24)) ([7ebbcbe](https://github.com/princjef/irontask/commit/7ebbcbe))

## [1.1.2](https://github.com/princjef/irontask/compare/v1.1.1...v1.1.2) (2019-07-15)


### Bug Fixes

* **interceptors:** use full URL for ref ([#22](https://github.com/princjef/irontask/issues/22)) ([9bcceb5](https://github.com/princjef/irontask/commit/9bcceb5))

## [1.1.1](https://github.com/princjef/irontask/compare/v1.1.0...v1.1.1) (2019-06-06)


### Bug Fixes

* **types:** support Typescript < 3.4 again ([#21](https://github.com/princjef/irontask/issues/21)) ([5e48b5b](https://github.com/princjef/irontask/commit/5e48b5b))

# [1.1.0](https://github.com/princjef/irontask/compare/v1.0.3...v1.1.0) (2019-06-06)


### Features

* **client:** support continuation token paging ([#20](https://github.com/princjef/irontask/issues/20)) ([9b8c784](https://github.com/princjef/irontask/commit/9b8c784))
* **task:** add support for lastUpdatedTime ([#18](https://github.com/princjef/irontask/issues/18)) ([dcd58e1](https://github.com/princjef/irontask/commit/dcd58e1))

## [1.0.3](https://github.com/princjef/irontask/compare/v1.0.2...v1.0.3) (2019-05-02)


### Bug Fixes

* **configuration:** add repository configuration ([#15](https://github.com/princjef/irontask/issues/15)) ([35c36c6](https://github.com/princjef/irontask/commit/35c36c6))

## [1.0.2](https://github.com/princjef/irontask/compare/v1.0.1...v1.0.2) (2019-04-09)


### Bug Fixes

* **processing:** prevent loop of lock renewals on success ([#14](https://github.com/princjef/irontask/issues/14)) ([f420424](https://github.com/princjef/irontask/commit/f420424)), closes [#13](https://github.com/princjef/irontask/issues/13)

## [1.0.1](https://github.com/princjef/irontask/compare/v1.0.0...v1.0.1) (2019-03-30)


### Bug Fixes

* **processing:** don't throw an error on renew lock for cancel ([#12](https://github.com/princjef/irontask/issues/12)) ([66d40a3](https://github.com/princjef/irontask/commit/66d40a3)), closes [#11](https://github.com/princjef/irontask/issues/11)

# 1.0.0 (2019-03-28)


### Features

* initial commit ([9e1041c](https://github.com/princjef/irontask/commit/9e1041c))
* **client:** add count and countAll APIs ([#9](https://github.com/princjef/irontask/issues/9)) ([d4083e7](https://github.com/princjef/irontask/commit/d4083e7))
* **processing:** track current run start time ([#7](https://github.com/princjef/irontask/issues/7)) ([6085285](https://github.com/princjef/irontask/commit/6085285))
