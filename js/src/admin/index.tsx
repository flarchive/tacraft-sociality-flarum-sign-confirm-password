import app from 'flarum/admin/app';
import Component from 'flarum/common/Component';
import { extend } from 'flarum/common/extend';
import type Mithril from 'mithril';

const SLUG = 'tacraft-sociality-sign-confirm-password';
const COLOR_TYPE = `${SLUG}.color`;

function t(key: string): Mithril.Children {
  return app.translator.trans(`${SLUG}.admin.${key}`) as Mithril.Children;
}

/**
 * A hex input with a native colour swatch next to it, bound to the same
 * setting stream so the swatch previews the value as it is typed.
 */
class ColorField extends Component<any> {
  view(): Mithril.Children {
    const { bidi, label, help } = this.attrs;

    return (
      <div className="Form-group">
        {label ? <label>{label}</label> : null}
        {help ? <div className="helpText">{help}</div> : null}
        <div className="ColorInput">
          <input className="FormControl" type="text" bidi={bidi} placeholder="#e5484d" />
          <input className="ColorInput-preview" type="color" bidi={bidi} />
        </div>
      </div>
    );
  }
}

app.initializers.add(SLUG, () => {
  extend('flarum/admin/components/AdminPage', 'customFieldComponents', function (items: any) {
    items.add(COLOR_TYPE, (attrs: any) => <ColorField {...attrs} />);
  });

  app.registry
    .for(SLUG)
    .registerSetting({
      type: COLOR_TYPE,
      setting: `${SLUG}.weakColor`,
      label: t('weak_color_label'),
      help: t('weak_color_help'),
    })
    .registerSetting({
      type: COLOR_TYPE,
      setting: `${SLUG}.mediumColor`,
      label: t('medium_color_label'),
      help: t('medium_color_help'),
    })
    .registerSetting({
      type: COLOR_TYPE,
      setting: `${SLUG}.strongColor`,
      label: t('strong_color_label'),
      help: t('strong_color_help'),
    })
    .registerSetting({
      type: 'switch',
      setting: `${SLUG}.enableInputBorderColor`,
      label: t('input_border_label'),
      help: t('input_border_help'),
    })
    .registerSetting({
      type: 'switch',
      setting: `${SLUG}.enableInputColor`,
      label: t('input_color_label'),
      help: t('input_color_help'),
    })
    .registerSetting({
      type: 'switch',
      setting: `${SLUG}.enablePasswordToggle`,
      label: t('toggle_label'),
      help: t('toggle_help'),
    });
});
