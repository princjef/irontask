## Contributing

### Developer Setup

For your first time setup, make sure you've done the following:

1.  Make sure you have Node.JS installed.
2.  Clone this repository to wherever you want to develop.
3.  Run `cd irontask` to enter the repository folder.
4.  Run `npm ci`, then `npm run build` to get things configured.

### Testing

All changes should be tested before a Pull Request is submitted. Once you have a
code change ready to submit, you will need to get your environment set up for
running tests. The following should be defined as environment variables for your
testing process:

- `COSMOS_ACCOUNT` - URL for the Cosmos DB account used (e.g.
  `https://youraccount.documents.azure.com:443/`)
- `COSMOS_DATABASE` - Name of the database to use for testing.
- `COSMOS_KEY` - Master key for the Cosmos DB account used

> You don't need a provisioned Cosmos DB account to run tests. You can use the
> [Azure Cosmos DB Emulator][] to try things out locally for free.

Once your environment is set up, you can run tests with:

```
npm test
```

### Committing

This project uses the [Angular commit style][] for generating changelogs and
determining release versions. Any pull request with commits that don't follow
this style will fail continuous integration. If you're not familiar with the
style, you can run the following instead of the standard `git commit` to get a
guided walkthrough to generating your commit message:

```
npm run commit
```

### Opening Issues and Pull Requests

All contributions are welcome. For any feature request or bug fix, consider
opening an issue first so we can discuss the problem/suggestion and decide on
the right course of action. For bug fixes and small improvements, feel free to
submit a Pull Request as well. Pull Requests are welcome for larger features as
well, but it is highly recommended that we discuss the approach in an issue
first to avoid painful code reviews for everyone.

Please try to keep a single Pull Request to a single conceptual change with one
commit that follows the [commit style](#committing) above. All Pull Requests are
checked against this convention and run all tests, so it's better to get it
right the first time. If you're stuck and can't figure out why the system
doesn't like your commits, feel free to reach out!

### Merging Pull Requests

When a Pull Request is ready to be merged, a package maintainer has to merge it.
If you are the person merging the Pull Request, choose the "Squash" option if
possible so that the Pull Request number is included in the commit message. The
Pull Request should merge as a single commit with a message that follows the
commit convention (generally the first/only commit of the PR itself). If the
commit message is done incorrectly, the master branch build will fail.

If the Pull Request contains breaking changes, hold off merging it until we're
ready to move to a new major version, as merging to master will trigger a major
version bump/publish automatically.

### Releasing

All features/bug fixes that are merged to master automatically trigger a new
release with an appropriate version bump for the change. This means that within
a few minutes of your feature/bugfix being accepted and merged, you will be able
to install a new version of the package with it included!

### Code of Conduct

This project has adopted the [Microsoft Open Source Code of Conduct][]. For more
information see the [Code of Conduct FAQ][] or contact
[opencode@microsoft.com][] with any additional questions or comments.

[azure cosmos db emulator]:
  https://docs.microsoft.com/azure/cosmos-db/local-emulator
[angular commit style]:
  https://github.com/angular/angular/blob/master/CONTRIBUTING.md#-commit-message-guidelines
[microsoft open source code of conduct]:
  https://opensource.microsoft.com/codeofconduct/
[code of conduct faq]: https://opensource.microsoft.com/codeofconduct/faq/
[opencode@microsoft.com]: mailto:opencode@microsoft.com
