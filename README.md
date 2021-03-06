# Enemene ✨

## Introduction

Enemene is a highly opinionated framework to quickly develop a classic REST API. It is based on Node.JS and Express and uses Sequelize for
database connections. The term "Enemene" is a very stupid idea, but I like it. It comes from the german audio play "Bibi Blocksberg" for
children. Bibi is a child witch who helps herself or others with the help of spells, and these spells always follow the format "
Enemene `something`, `some other thing rhyming with something`. Hex Hex!", e.g. "Enemene Maus, Lampe gehe aus. Hex Hex!" ('Enemene mouse,
lamp go out!"). As you see, **enemene** is the magic word here. That's why its used for the CLI in this framework.

## Installation

````
npm install enemene
````

## First configuration

````
Enemene.create(config)              // Create new server
.then(server => {
    server.setup(routers, views)    // Inject all routers and views to the server
        .then(() => {
            server.start();         // Start the server
    });
});
````

## Concepts

### Entities

Entities are the definition of models. You can create them by executing `enemene mentity` on the command line. Annotate a class property
with `@Field`, `@Reference`, `@Collection` or `@Composition` to create a field. To add a calculated attribute that gets evaluated on-the
-fly, annotate a class method with `@Calculated`.

### Views

Views build an abstraction layer to the data. A view is defined as a class with an ID and the entity it is based by using `@ViewDefinition`.
To limit the access granted by this view to a subset of fields, these can be defined in the view by their name or (with complex fields like
references or collections) with a sub-view (use `@ViewField`). Only the fields defined in the view will be included in GET responses and
available for setting in PUT/POST requests. Additionally, you can limit the objects accessible by the view by providing a filter (see "
Filters"). Additionally, a user who performs actions with this view must have a `ViewPermission` allowing the corresponding action. You can
create a rudimentary view by executing `enemene miew` on the command line. Here is an example for a basic view:

````
@ViewDefinition("5ee1bb90-7d28-4ba0-9ee4-f9bcdbbe002e", () => MyEntity)
class MyEntityView extends View<MyEntity> {

    @ViewField(0)
    attribute: string;
    
    @ViewField({
        position: 1,
        subView: MySecondView,
    })
    collectionAttribute: MySecondView[];
} 
````

### Controllers

If a simple data access layer does not suffice, you can define custom controllers that provide custom routes. Here is an example:

````
@Controller("example")
export class ExampleController extends AbstractController {

    @Get("/:id")
    async getStuff(@Path("id") id: string, 
                   @CurrentUser user: User): Promise<string> {
        // ...
        return id;
    }
}
````

You can inject parameters into every route handler function. See the reference (TBD) for more info on what can be injected.

### Filters

Filters can be defined and used for views or in custom route handlers. Define a filter by using `Filter`:

````
Filter.and(
    Filter.equals("firstName", "Anton")
    Filter.not(
        Filter.exists("role", 
            Filter.equals("name", "Developer")
        )
    )
)
// = Find all where firstName is "Anton" and the role is not the one called "Developer". 
````
