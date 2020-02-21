var application = require("@nativescript/core/application");
var localize = require("nativescript-l");

application.setResources({ L: localize });
application.run({ moduleName: "app-root" });
