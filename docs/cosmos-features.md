# Cosmos DB Feature Needs

There are a few features/behaviors common to other libraries which are missing
or suboptimal in this library. If you would like to see these features
implemented or improved in the future, please tell the Cosmos DB team that you 
would like the corresponding backing features implemented in the database by
voting for them using the feedback links below.

### Efficient Listing of Large Sets of Tasks

When listing large sets of tasks, we paginate the results by default to reduce
the total amount of data pulled from the database and held in the client at a
time. However, when pulling later pages of tasks, we must pull back every result
from the previous pages and filter them out on the client. To achieve more
efficient paging, we need to be able to skip the earlier pages in the database
itself. See the page below to vote for this feature:

https://feedback.azure.com/forums/263030-azure-cosmos-db/suggestions/6350987--documentdb-allow-paging-skip-take

> NOTE: this feature has been implemented in Cosmos DB but still has suboptimal
> performance at time of writing. See the linked feedback item for more
> information.

### Efficient Updates

The locking and update patterns of this package rely on making several small
updates to a task in the database. If your task is quite large or you need to
make many such updates, the cumulative cost of sending the entire task as part
of each update adds up. This process becomes more efficient and cost effective
if the database supports partial updates. See the page below to vote for this
feature:

https://feedback.azure.com/forums/263030-azure-cosmos-db/suggestions/6693091-be-able-to-do-partial-updates-on-document
