## What is it?

This git repo is based on [hexojs](https://github.com/hexojs/hexo) and [hexo-theme-next](https://github.com/theme-next/hexo-theme-next) to build Frost He's blog.

## How does it work?

## Setup

### Initialize hexo

```bash
$ hexo init <folder>
```

### Install NexT theme via npm

```bash
$ npm install hexo-theme-next@latest
```

Change `_config.yml` to use next theme:

```yaml
theme: next
```

## Customize the site

### Theme Settings

- [Dark mode](https://theme-next.js.org/docs/theme-settings/#Dark-Mode): Enabled
- [Favicon](https://theme-next.js.org/docs/theme-settings/#Configuring-Favicon): Replaced
- [Menu Items](https://theme-next.js.org/docs/theme-settings/#Configuring-Menu-Items): Icons modified

#### Sidebar

- [Sidebar Style](https://theme-next.js.org/docs/theme-settings/sidebar.html#Sidebar-Style)
  - postion: left
  - width: 300
  - display: always
- [Configuring Avatar](https://theme-next.js.org/docs/theme-settings/sidebar.html#Configuring-Avatar):
  - url set
  - rounded: true
- [Site state](https://theme-next.js.org/docs/theme-settings/sidebar.html#Sidebar-Site-State): enabled
- [Social Links](https://theme-next.js.org/docs/theme-settings/sidebar.html#Sidebar-Social-Links): enabled
  - Icons enabled: true
  - Icons only: true
  - transition: true
- [Sidebar Blogrolls](https://theme-next.js.org/docs/theme-settings/sidebar.html#Sidebar-Blogrolls):
- [Sidebar TOC](https://theme-next.js.org/docs/theme-settings/sidebar.html#Sidebar-TOC):
  - enable: false
  - number: true
  - wrap: true
  - expand_all: true
  - max_depth: 2

##### Sidebar Customization

#### Footer

[Footer Configuration](https://theme-next.js.org/docs/theme-settings/footer.html#Site-Footer-Setting):

- Since: 2015
- Icon: fa fa-user
- Copyright: enabled

#### Post Settings

- [Post Wordcount](https://theme-next.js.org/docs/theme-settings/posts.html#Post-Wordcount)
  - [hexo-word-counter](https://github.com/next-theme/hexo-word-counter): `npm install hexo-word-counter`
  - Wrod count per post: enabled
  - Word count total at footer: enabled
  - Reading time per post: disabled
  - Reading time total at footer: disabled
- [Tag Icon](https://theme-next.js.org/docs/theme-settings/posts.html#Tag-Icon): true
- [Donate Settings](https://theme-next.js.org/docs/theme-settings/posts.html#Donate-Settings)

#### Localization(i18n)

- [Override Default Translations](https://theme-next.js.org/docs/theme-settings/internationalization.html#Override-Default-Translations)
- Chinese certain translation overwritten.

#### Custom Pages

- [Archive Page Modified](https://theme-next.js.org/docs/theme-settings/custom-pages.html#Use-Archive-Page-as-Home-Page): enabled
  - Index as home page
  - Archive generator per page adjusted
- [Adding Categories Page](https://theme-next.js.org/docs/theme-settings/custom-pages.html#Adding-%C2%ABTags%C2%BB-Page)
- [Adding About Page](https://theme-next.js.org/docs/theme-settings/custom-pages.html#Adding-%C2%ABTags%C2%BB-Page)

#### Misc

- [Preconnect](https://theme-next.js.org/docs/theme-settings/miscellaneous.html#Preconnect): enabled

#### SEO Setting

[SEO Setting](https://theme-next.js.org/docs/theme-settings/seo.html#SEO-Setting)

- index_with_subtitle: true
- [Google Webmaster Tools](https://theme-next.js.org/docs/theme-settings/seo.html#Webmaster-Tools): enabled

### 3rd Party Services

#### Statistics and Analytics

- [Google Analytics](https://theme-next.js.org/docs/third-party-services/statistics-and-analytics.html#Analytics-Tools): enabled

## Deployment

With the new git repo setup, I uses the recommanded Github Actions to perform deployment on CI pipelines. See `.github/workflows/pages.yml` for more details.
