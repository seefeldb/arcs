// code
import Xen from '../../components/xen/xen.js';
import ArcsUtils from '../lib/arcs-utils.js';

// elements
import './arc-handle.js';

// globals
const shellPath = window.shellPath;

// templates
const template = Xen.html`

  <arc-handle arc="{{arc}}" data="{{themeData}}" options="{{themeHandleOptions}}" on-change="_onShellThemeChange"></arc-handle>
  <arc-handle arc="{{arc}}" data="{{usersHandleData}}" options="{{usersHandleOptions}}"></arc-handle>
  <arc-handle arc="{{arc}}" data="{{userHandleData}}" options="{{userHandleOptions}}"></arc-handle>
  <arc-handle arc="{{arc}}" data="{{arcsHandleData}}" options="{{arcsHandleOptions}}" on-change="_onArcsHandleChange"></arc-handle>
  <!-- ensures #BOXED_avatar exists for resolving recipes, even if there are no avatars to box -->
  <arc-handle arc="{{arc}}" options="{{boxedAvatarHandleOptions}}"></arc-handle>

`;

class ShellHandles extends Xen.Base {
  static get observedAttributes() {
    return ['arc', 'users', 'user', 'visited'];
  }
  get template() {
    return template;
  }
  _getInitialState() {
    this._watchGeolocation();
    const typesPath = `${shellPath}/app-shell/artifacts`;
    return {
      themeData: {
        mainBackground: 'white'
      },
      arcsHandleOptions: {
        schemas: `${typesPath}/arc-types.manifest`,
        type: '[ArcMetadata]',
        name: 'ArcMetadata',
        tags: ['#arcmetadata']
      },
      themeHandleOptions: {
        schemas: `${typesPath}/arc-types.manifest`,
        type: 'Theme',
        name: 'ShellTheme',
        tags: ['#shelltheme']
      },
      userHandleOptions: {
        schemas: `${typesPath}/identity-types.manifest`,
        type: 'Person',
        name: 'User',
        tags: ['#user']
      },
      usersHandleOptions: {
        schemas: `${typesPath}/identity-types.manifest`,
        type: '[Person]',
        name: 'Users',
        tags: ['#identities']
      },
      boxedAvatarHandleOptions: {
        schemas: `${typesPath}/identity-types.manifest`,
        type: '[Avatar]',
        name: 'Avatars',
        tags: ['#BOXED_avatar'],
        id: 'BOXED_avatar',
        asContext: true
      }
    };
  }
  _watchGeolocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.watchPosition(({coords}) => {
        const {geoCoords} = this._state;
        const {latitude, longitude} = coords;
        // Skip setting the position if it's the same as what we've already got.
        if (!geoCoords || geoCoords.latitude != latitude || geoCoords.longitude != longitude) {
          this._setState({geoCoords: {latitude, longitude}});
        }
      });
    }
  }
  _update(props, state, lastProps, lastState) {
    const {users, user, visited, arc} = props;
    const {geoCoords} = state;
    if (user && (user !== lastProps.user || geoCoords !== lastState.geoCoords)) {
      state.userHandleData = this._renderUser(user, geoCoords);
    }
    if (users && (users !== lastProps.users || !state.usersHandleData)) {
      state.usersHandleData = this._renderUsers(users);
    }
    if (visited && (visited != lastProps.visited)) {
      state.arcsHandleData = this._renderVisited(user, visited);
    }
    super._update(props, state);
  }
  _render(props, state) {
    ShellHandles.log(props, state);
    return [state, props];
  }
  X_render({arc}, {
      themeData,
      arcsHandleOptions,
      arcsHandleData,
      themeHandleOptions,
      userHandleOptions,
      userHandleData,
      usersHandleOptions,
      usersHandleData,
      boxedAvatarHandleOptions}) {
    ShellHandles.log(this._props, this._state);
    const render = {
      arc,
      themeData,
      arcsHandleOptions,
      arcsHandleData,
      themeHandleOptions,
      userHandleOptions,
      userHandleData,
      usersHandleOptions,
      usersHandleData,
      boxedAvatarHandleOptions
    };
    return render;
  }
  _renderUser(user, geoCoords) {
    return {
      id: user.id,
      name: user.name,
      location: geoCoords
    };
  }
  _renderUsers(users) {
    return Object.keys(users).map(id => {
      return {
        id: id,
        name: users[id].name
      };
    });
  }
  _renderVisited(user, visited) {
    const data = Object.keys(visited).map(key => {
      let {metadata, profile} = visited[key];
      let href = `${location.origin}${location.pathname}?arc=${key}&user=${user.id}`;
      if (metadata.externalManifest) {
        href += `&manifest=${metadata.externalManifest}`;
      }
      return {
        key: key,
        description: metadata.description || key.slice(1),
        color: metadata.color || 'gray',
        bg: metadata.bg,
        href: href,
        profile: profile
      };
    });
    // prepend New Arc item
    data.unshift({
      key: '*',
      blurb: 'New Arc',
      description: 'New Arc',
      bg: 'black',
      color: 'white',
      href: `?arc=*&user=${user.id}`
    });
    return data;
  }
  _onData(e, data) {
    if (this._setIfDirty({[e.type]: data})) {
      ShellHandles.log(e.type, data);
    }
  }
  async _onShellThemeChange(e, handle) {
    const theme = (await ArcsUtils.getHandleData(handle)).rawData;
    ShellHandles.log('ShellThemeChange', theme);
    this._fire('theme', theme);
  }
}

ShellHandles.log = Xen.Base.logFactory('ShellHandles', '#004f00');
customElements.define('shell-handles', ShellHandles);