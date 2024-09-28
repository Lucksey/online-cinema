import { Injectable, NotFoundException } from "@nestjs/common";
import { ModelType } from "@typegoose/typegoose/lib/types";
import { InjectModel } from "nestjs-typegoose";
import { UpdateMovieDto } from "./dto/update-movie.dto";
import { MovieModel } from "./movie.model";
import { Types } from "mongoose";
import { TelegramService } from "src/telegram/telegram.service";

@Injectable()
export class MovieService {
  constructor(
    @InjectModel(MovieModel) private readonly MovieModel: ModelType<MovieModel>,
    private readonly telegramService: TelegramService
  ) {}

  async getAll(searchTerm?: string) {
    let options = {}

    if (searchTerm)
      options = {
        $or: [
          {
            title: new RegExp(searchTerm, 'i'),
          },
        ],
      }

    return this.MovieModel.find(options)
      .select('-updatedAt -__v')
      .sort({
        createdAt: 'desc',
      })
      .populate('genres actors')
      .exec()
  }

  async bySlug(slug: string) {
    const doc = await this.MovieModel
      .findOne({ slug })
      .populate('genres actors')
      .exec()
    if (!doc) throw new NotFoundException('Movie not found')
    return doc
  }

  async byActor(actorId: Types.ObjectId) {
    const doc = await this.MovieModel.find({ actors: actorId }).exec()
    if (!doc) throw new NotFoundException('Movies not found')
    return doc
  }

  async byGenres(genres:Types.ObjectId[]) {
    const movie = await this.MovieModel.find({ genres: { $in: genres } })
    if (!movie) throw new NotFoundException('Movie not found')
    return movie
  }

  async getMostPopular() {
    return await this.MovieModel
      .find({ countOpened: { $gt: 0 } })
      .sort({ countOpened: -1 })
      .populate('genres')
      .exec()
  }

  async updateCountOpened(slug: string) {
    const updateDoc = await this.MovieModel
      .findOneAndUpdate(
        { slug },
        {
          $inc: {
            countOpened: 1,
          },
        },
        {
          new: true,
        }
      )
      .exec()

    if (!updateDoc) throw new NotFoundException('Movie not found')

    return updateDoc
  }

  async updateRating(id: Types.ObjectId, newRating: number) {
    return this.MovieModel
      .findByIdAndUpdate(
        id,
        {
          rating: newRating,
        },
        {
          new: true,
        }
      )
      .exec()
  }

  /* Admin Place */

  async byId(_id: string) {
    const doc = await this.MovieModel.findById(_id)

    if (!doc) throw new NotFoundException('Movie not found')

    return doc
  }

  async create() {
    const defaultValue: UpdateMovieDto = {
      bigPoster: '',
      poster: '',
      title: '',
      slug: '',
      videoUrl: '',
      genres: [],
      actors: [],
    }
    const doc = await this.MovieModel.create(defaultValue)
    return doc._id
  }

  async update(_id: string, dto: UpdateMovieDto) {
    /*Telegram notification  */
    if (!dto.isSendTelegram) {
      await this.sendNotifications(dto)
      dto.isSendTelegram = true
    }


    const updateDoc = await this.MovieModel
      .findByIdAndUpdate(_id, dto, {
        new: true,
      })
      .exec()

    if (!updateDoc) throw new NotFoundException('Movie not found')

    return updateDoc
  }

  async delete(id: string) {
    const deleteDoc = await this.MovieModel.findByIdAndDelete(id).exec()

    if (!deleteDoc) throw new NotFoundException('Movie not found')

    return deleteDoc
  }

   async sendNotifications(dto: UpdateMovieDto) {
    // if (process.env.NODE_ENV !== 'development')
    //await this.telegramService.sendPhoto(dto.poster)
     await this.telegramService.sendPhoto(
     	'https://variety.com/wp-content/uploads/2023/03/John-Wick-3.jpg?w=1000&h=562&crop=1')

    const msg = `<b>${dto.title}</b>`

    await this.telegramService.sendMessage(msg, {
      reply_markup: {
        inline_keyboard: [
          [
            {
              url: 'https://www.netflix.com/sk/',
              text: '🍿 Go to watch',
            },
          ],
        ],
      },
    })
  }
}