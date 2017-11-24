import * as angular from "angular";
import "./util/matchers";
import { tail, curry, PathNode, PathUtils, ViewService, StateMatcher, StateBuilder, StateObject } from "@uirouter/core";
import { ng1ViewsBuilder, getNg1ViewConfigFactory } from "../src/statebuilders/views";
import { Ng1StateDeclaration } from "../src/interface";
declare var inject;

describe('view', function() {
  let scope, $compile, $injector, elem, $controllerProvider, $urlMatcherFactoryProvider;
  let root: StateObject, states: {[key: string]: StateObject};

  beforeEach(angular.mock.module('ui.router', function(_$provide_, _$controllerProvider_, _$urlMatcherFactoryProvider_) {
    _$provide_.factory('foo', function() {
      return "Foo";
    });
    $controllerProvider = _$controllerProvider_;
    $urlMatcherFactoryProvider = _$urlMatcherFactoryProvider_;
  }));

  let register;
  let registerState = curry(function(_states, stateBuilder, config) {
    let state = StateObject.create(config);
    let built: StateObject = stateBuilder.build(state);
    return _states[built.name] = built;
  });

  beforeEach(inject(function ($rootScope, _$compile_, _$injector_) {
    scope = $rootScope.$new();
    $compile = _$compile_;
    $injector = _$injector_;
    elem = angular.element('<div>');

    states = {};
    let matcher = new StateMatcher(states);
    let stateBuilder = new StateBuilder(matcher, $urlMatcherFactoryProvider);
    stateBuilder.builder('views', ng1ViewsBuilder);
    register = registerState(states, stateBuilder);
    root = register({name: ""});
  }));

  describe('controller handling', function() {
    let state, path: PathNode[], ctrlExpression;
    beforeEach(() => {
      ctrlExpression = null;
      const stateDeclaration: Ng1StateDeclaration = {
        name: "foo",
        template: "test",
        controllerProvider: ["foo", function (/* $stateParams, */ foo) { // todo: reimplement localized $stateParams
          ctrlExpression = /* $stateParams.type + */ foo + "Controller as foo";
          return ctrlExpression;
        }]
      };

      state = register(stateDeclaration);
      let $view = new ViewService();
      $view._pluginapi._viewConfigFactory("ng1", getNg1ViewConfigFactory());

      let _states = [root, state];
      path = _states.map(_state => new PathNode(_state));
      PathUtils.applyViewConfigs($view, path, _states);
    });

    it('uses the controllerProvider to get controller dynamically', inject(function ($view, $q) {
      $controllerProvider.register("AcmeFooController", function($scope, foo) { });
      elem.append($compile('<div><ui-view></ui-view></div>')(scope));

      let view = tail(path).views[0];
      view.load();
      $q.flush();
      expect(ctrlExpression).toEqual("FooController as foo");
    }));
  });
});