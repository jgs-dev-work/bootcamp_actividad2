// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Mascota from 'App/Models/Mascota'

export default class MascotasController {
  async setMascota({ request, response }: HttpContextContract) {
    try {
      const data_mascota = request.only([
        'codigo_animal',
        'nombre_animal',
        'especie',
        'raza',
        'genero',
        'edad',
      ])
      const codigo_animal = data_mascota.codigo_animal
      const mascota_exite = await this.mascotaExiste(codigo_animal)
      if (mascota_exite === 0) {
        await Mascota.create(data_mascota)
        response.status(200).json({ msg: 'Mascota creado exitosamente' })
      } else response.status(400).json({ msg: 'codigo de la mascota ya esta registrado!' })
    } catch (error) {
      console.log(error)
      response.status(500).json({ msg: 'Error en el servidor' })
    }
  }

  async mascotaExiste(codigo_animal: number): Promise<number> {
    const total = await Mascota.query()
      .where({ codigo_animal: codigo_animal })
      .count('*')
      .from('mascotas')
    return parseInt(total[0]['count(*)'])
  }

  public async getMascotas(): Promise<Mascota[]> {
    return await Mascota.all()
  }
  public async getMascotasPorEspecie({ request }: HttpContextContract): Promise<Mascota[]> {
    const especie = request.param('especie')
    const mascotas = await Mascota.query().where('especie', 'less or equal', `%${especie}%`)
    return mascotas
  }

  // filtra las mascotas menores o iguales a la edad ingresada como parametro
  public async getMascotasPorEdad({ request }: HttpContextContract): Promise<Mascota[]> {
    const edad = request.param('edad')
    const mascotas = await Mascota.query().where('edad', '<=', `${edad}`)
    return mascotas
  }

  public async deleteMascota({ request, response }: HttpContextContract) {
    try {
      const id = request.param('id')
      const eliminar = await Mascota.query().where('codigo_animal', id).delete()
      console.log('HERE  AAA', eliminar)
      response.status(200).json({ msg: 'Registro eliminado.' })
    } catch (error) {
      console.log(error)
      response.status(500).json({ msg: 'No se pudo eliminar la mascota' })
    }
  }

  public async editMascota({ request, response }: HttpContextContract) {
    try {
      const id = request.param('id')
      const datos = request.all()
      const mascota = await Mascota.findOrFail(id)
      mascota.nombre_animal = datos.nombre_animal
      mascota.especie = datos.especie
      mascota.edad = datos.edad
      mascota.genero = datos.genero
      mascota.raza = datos.raza
      await mascota.save()
      response.status(200).json({ msg: `Registro ${id} actualizado.` })
    } catch (error) {
      console.log(error)
      response.status(500).json({ msg: 'No se pudo editar la mascota con el id ingresado' })
    }
  }
}
