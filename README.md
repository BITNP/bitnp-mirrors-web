# BITNP 镜像站 Web

这是一个利用 Hugo 生成镜像站静态页面的项目。

## 如何增加镜像项目

0. 假设这个项目的文件夹名为 slug
1. 配置 tunasync
2. 在本仓库根目录 `hugo new help/slug.md`，或者 `cp archetypes/help.md content/help/slug.md`
3. 修改 Markdown 文件中的 title 为产品显示名（大小写），summary 为显示在首页的简介
4. 设置 categories 为 `data/categories.yaml` 中存在的任意 key （键），才会显示在首页的对应分类中（设置了多个分类会显示多次），否则首页不显示；is_new 控制“新”标签的显示
5. 如果还未能撰写帮助或帮助还不能发布，请设置 help_available 为 `false`（`---` 下方可留空），否则请设置为 `true`
6. date 项需设置为发布日期或留空，如果 date 比 Hugo 生成站点的时间晚，则项目不会被生成。此外你也可以使用 `draft: true` 项控制生成状态
7. 首页和帮助显示的为 help 中的有效项目，而状态页显示的是同步软件中存在的项目

## 编译主题 Javascript

```console
$ cd themes/bitnp-mirror/src
$ npm install
$ npx webpack
```
