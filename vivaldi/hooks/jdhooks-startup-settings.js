//Settings: select hooks to load
//Настройки: выбор хуков для загрузки

//settings
vivaldi.jdhooks.hookClass('StartupSetting', function(reactClass) {

    var newScripts = {};
    var jdhooksStartupSettings;

    //settings init
    vivaldi.jdhooks.hookMember(reactClass, 'componentWillMount', function(hookData) {

        var settings = vivaldi.jdhooks.require('_VivaldiSettings');

        this.updateHookSettings = function() {
            settings.set({
                JDHOOKS_STARTUP: jdhooksStartupSettings
            });
        };

        this.toggleDefaultLoad = function() {
            jdhooksStartupSettings.defaultLoad = !this.state.jdhooks_defaultLoad;
            this.updateHookSettings();
            this.setState({
                jdhooks_defaultLoad: !this.state.jdhooks_defaultLoad
            });
        };

        this.toggleScriptState = function(script) {
            jdhooksStartupSettings.scripts[script] = !this.state['jdhooks_' + script];
            this.updateHookSettings();
            var state = {};
            state['jdhooks_' + script] = !this.state['jdhooks_' + script];
            this.setState(state);
        };

        function updateState(obj) {
            var state = {
                jdhooks_defaultLoad: jdhooksStartupSettings.defaultLoad
            };

            //states
            for (script in vivaldi.jdhooks._hooks) {
                if (!(script in jdhooksStartupSettings.scripts)) {
                    jdhooksStartupSettings.scripts[script] = jdhooksStartupSettings.defaultLoad;
                    newScripts[script] = true;
                    updated = true;
                }

                state['jdhooks_' + script] = jdhooksStartupSettings.scripts[script];
            };

            obj.setState(state);
        }

        if (!jdhooksStartupSettings) {
            //read cfg, fill props & state
            settings.get('JDHOOKS_STARTUP', function(e) {
                if (undefined === e) e = {};
                if (undefined === e.defaultLoad) e.defaultLoad = true;
                if (undefined === e.scripts) e.scripts = {};

                jdhooksStartupSettings = e;
                var updated = false;

                //remove deleted scripts from settings
                for (script in jdhooksStartupSettings.scripts) {
                    if (!(script in vivaldi.jdhooks._hooks)) {
                        updated = true;
                        delete jdhooksStartupSettings.scripts[script];
                    }
                }

                updateState(this);

                if (updated)
                    this.updateHookSettings();

            }.bind(this));
        } else
            updateState(this);
    });


    vivaldi.jdhooks.hookMember(reactClass, 'render', null, function(hookData) {

        //check if settings are loaded
        if (hookData.retValue && (undefined !== this.state.jdhooks_defaultLoad)) {

            var React = vivaldi.jdhooks.require('react_React');

            var subitems = [];

            var scriptNames = Object.keys(vivaldi.jdhooks._hooks);
            scriptNames.sort(function(first, second) {
                return first.localeCompare(second, {
                    sensitivity: "accent"
                });
            });

            for (scriptNum in scriptNames) {
                var script = scriptNames[scriptNum];
                var desc = vivaldi.jdhooks._hooks_desc[script];
                var descNode = null;
                if (desc != undefined && desc != null)
                {
                  descNode = React.createElement("div", null, desc);
                }

                var newLabel = !newScripts[script] ? null : React.createElement("span", {
                    style: {
                        color: "red",
                        textShadow: "rgb(255, 255, 255) 0px 0px 0.2em, rgb(0,0, 0) 0px 0px 0.2em"
                    }
                }, " (NEW!)");

                subitems.push(
                    React.createElement("div", {
                            className: "setting-single"
                        },
                        React.createElement("label", null,
                            React.createElement("input", {
                                type: "checkbox",
                                checked: this.state['jdhooks_' + script],
                                onChange: this.toggleScriptState.bind(this, script)
                            }),
                            React.createElement("span", null,
                                script,
                                newLabel,
                                descNode
                            )
                        )
                    )
                );
            };

            hookData.retValue.props.children.push(
                React.createElement("div", null,
                    React.createElement("h2", null, "Hooks"),
                    React.createElement("div", {
                            className: "setting-group"
                        },
                        React.createElement("div", {
                                className: "setting-single"
                            },
                            React.createElement("label", null,
                                React.createElement("input", {
                                    type: "checkbox",
                                    checked: this.state.jdhooks_defaultLoad,
                                    onChange: this.toggleDefaultLoad.bind(this)
                                }),
                                React.createElement("span", null, "Startup mode for new items")
                            )
                        ),
                        React.createElement("div", {
                                className: "setting-group pad-top"
                            },
                            React.createElement("h3", null, "Load hook files"),
                            subitems)
                    )
                )
            );
        }

        return hookData.retValue;
    }); //vivaldi.jdhooks.hookMember(reactClass, 'render', null, function(hookData)

});
