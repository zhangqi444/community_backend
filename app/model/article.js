'use strict';

const user = require('./user');

module.exports = app => {
  const mongoose = app.mongoose;
  const mongoosastic = require('mongoosastic');
  const User = require('./user');
  const { ARTICLE_TYPE, ARTICLE_MEDIA_TYPE } = require('../constant/article');
  const Schema = mongoose.Schema;

  var coAuthorSchema = mongoose.Schema({
    author: { type: Schema.Types.ObjectId, ref: 'User', es_schema: User, es_indexed:true, autopopulate: true },
  }, { _id : false });

  const ArticleSchema = new Schema({
    // **** 文章类特殊属性 ****

    // **** 活动类特殊属性 ****
    // 合作作者
    coAuthors: [coAuthorSchema],
    // 视频内容
    video: { vid: { type: String }, source: { type: String }, url: { type: String } },

    src: { type: String },
    srcType: { type: String },
    mediaType: { type: String, enum: Object.values(ARTICLE_MEDIA_TYPE) },
    type: { type: String, enum: Object.values(ARTICLE_TYPE), default: ARTICLE_TYPE.DEFAULT },

    // **** 通用类内容 ****
    // 标题
    title: { type: String, es_indexed: true },
    // 内容
    content: { type: String, es_indexed: true },
    cover: { type: String, },
    // 标签
    tags: { type: Array, default: [], ref: 'Tag', es_indexed: true },
    // 点赞数量
    thumbCount: { type: Number, default: 0 },
    // 分享次数
    shareCount: { type: Number, default: 0 },
    // 访问数量
    visitCount: { type: Number, default: 0 },
    // 回复数量
    commentCount: { type: Number, default: 0 },
    // 文章收藏数量
    collectCount: { type: Number, default: 0 },

    // 发布者
    author: { type: Schema.Types.ObjectId, ref: 'User', es_schema: User, es_indexed:true, autopopulate: true },
    // 是否被锁定
    isBlocked: { type: Boolean, default: false },
    // 是否被删除
    isDeleted: { type: Boolean, default: false },
    // 创建时间
    createdAt: { type: Date, default: Date.now },
    // 更新时间
    updatedAt: { type: Date, default: Date.now },
  });

  // 对创建时间进行索引
  ArticleSchema.index({ createdAt: -1 });
  // 对文章作者进行索引
  ArticleSchema.index({ author: 1, createdAt: -1 });

  ArticleSchema.plugin(mongoosastic, {
    filter: function(doc) {
      return doc.isDeleted === true || doc.isBlocked === true;
    }
  });
  ArticleSchema.plugin(require('mongoose-autopopulate'));

  const model = mongoose.model('Article', ArticleSchema);

  // 需要为已有的内容创建elasticsearch index时使用
  // const stream = model.synchronize(function (e) {
  //   console.error('Synchronize error: ' + e)
  // });

  return model;
};
