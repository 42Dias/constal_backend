import Roles from './roles';
import Plans from './plans';
import Storage from './storage';
//a
const storage = Storage.values;
const roles = Roles.values;
const plans = Plans.values;

class Permissions {
  static get values() {
    return {
      tenantEdit: {
        id: 'tenantEdit',
        allowedRoles: [roles.admin],
        allowedPlans: [
          plans.free,
          plans.growth,
          plans.enterprise,
        ],
      },
      tenantDestroy: {
        id: 'tenantDestroy',
        allowedRoles: [roles.admin],
        allowedPlans: [
          plans.free,
          plans.growth,
          plans.enterprise,
        ],
      },
      planEdit: {
        id: 'planEdit',
        allowedRoles: [roles.admin],
        allowedPlans: [
          plans.free,
          plans.growth,
          plans.enterprise,
        ],
      },
      planRead: {
        id: 'planRead',
        allowedRoles: [roles.admin],
        allowedPlans: [
          plans.free,
          plans.growth,
          plans.enterprise,
        ],
      },
      userEdit: {
        id: 'userEdit',
        allowedRoles: [roles.admin, roles.pessoa],
        allowedPlans: [
          plans.free,
          plans.growth,
          plans.enterprise,
        ],
      },
      userDestroy: {
        id: 'userDestroy',
        allowedRoles: [roles.admin],
        allowedPlans: [
          plans.free,
          plans.growth,
          plans.enterprise,
        ],
      },
      userCreate: {
        id: 'userCreate',
        allowedRoles: [roles.admin],
        allowedPlans: [
          plans.free,
          plans.growth,
          plans.enterprise,
        ],
      },
      userImport: {
        id: 'userImport',
        allowedRoles: [roles.admin],
        allowedPlans: [
          plans.free,
          plans.growth,
          plans.enterprise,
        ],
      },
      userRead: {
        id: 'userRead',
        allowedRoles: [roles.admin, roles.pessoa, roles.empresa],
        allowedPlans: [
          plans.free,
          plans.growth,
          plans.enterprise,
        ],
      },
      userAutocomplete: {
        id: 'userAutocomplete',
        allowedRoles: [roles.admin],
        allowedPlans: [
          plans.free,
          plans.growth,
          plans.enterprise,
        ],
      },
      auditLogRead: {
        id: 'auditLogRead',
        allowedRoles: [roles.admin],
        allowedPlans: [
          plans.free,
          plans.growth,
          plans.enterprise,
        ],
      },
      settingsEdit: {
        id: 'settingsEdit',
        allowedRoles: [roles.admin],
        allowedPlans: [
          plans.free,
          plans.growth,
          plans.enterprise,
        ],
        allowedStorage: [
          storage.settingsBackgroundImages,
          storage.settingsLogos,
        ],
      },
      pessoaFisicaImport: {
        id: 'pessoaFisicaImport',
        allowedRoles: [roles.admin],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
      },
      pessoaFisicaCreate: {
        id: 'pessoaFisicaCreate',
        allowedRoles: [roles.admin, roles.pessoa],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
        allowedStorage: [
          storage.pessoaFisicaFoto,
        ],
      },
      pessoaFisicaEdit: {
        id: 'pessoaFisicaEdit',
        allowedRoles: [roles.admin, roles.pessoa],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
        allowedStorage: [
          storage.pessoaFisicaFoto,
        ],
      },
      pessoaFisicaDestroy: {
        id: 'pessoaFisicaDestroy',
        allowedRoles: [roles.admin,],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
        allowedStorage: [
          storage.pessoaFisicaFoto,
        ],
      },
      pessoaFisicaRead: {
        id: 'pessoaFisicaRead',
        allowedRoles: [roles.admin, roles.pessoa],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
      },
      pessoaFisicaAutocomplete: {
        id: 'pessoaFisicaAutocomplete',
        allowedRoles: [roles.admin, ],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
      },

      empresaImport: {
        id: 'empresaImport',
        allowedRoles: [roles.admin],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
      },
      empresaCreate: {
        id: 'empresaCreate',
        allowedRoles: [roles.admin, roles.empresa],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
        allowedStorage: [
          storage.empresaFoto,
        ],
      },
      empresaEdit: {
        id: 'empresaEdit',
        allowedRoles: [roles.admin, roles.empresa],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
        allowedStorage: [
          storage.empresaFoto,
        ],
      },
      empresaDestroy: {
        id: 'empresaDestroy',
        allowedRoles: [roles.admin],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
        allowedStorage: [
          storage.empresaFoto,
        ],
      },
      empresaRead: {
        id: 'empresaRead',
        allowedRoles: [roles.admin, roles.empresa],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
      },
      empresaAutocomplete: {
        id: 'empresaAutocomplete',
        allowedRoles: [roles.admin, ],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
      },

      cartaoImport: {
        id: 'cartaoImport',
        allowedRoles: [roles.admin],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
      },
      cartaoCreate: {
        id: 'cartaoCreate',
        allowedRoles: [roles.admin, roles.pessoa],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
        allowedStorage: [

        ],
      },
      cartaoEdit: {
        id: 'cartaoEdit',
        allowedRoles: [roles.admin, roles.pessoa],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
        allowedStorage: [

        ],
      },
      cartaoDestroy: {
        id: 'cartaoDestroy',
        allowedRoles: [roles.admin, roles.pessoa],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
        allowedStorage: [

        ],
      },
      cartaoRead: {
        id: 'cartaoRead',
        allowedRoles: [roles.admin, roles.pessoa],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
      },
      cartaoAutocomplete: {
        id: 'cartaoAutocomplete',
        allowedRoles: [roles.admin, roles.pessoa],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
      },

      produtoImport: {
        id: 'produtoImport',
        allowedRoles: [roles.admin],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
      },
      produtoCreate: {
        id: 'produtoCreate',
        allowedRoles: [roles.admin, roles.empresa],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
        allowedStorage: [
          storage.produtoFotos,
        ],
      },
      produtoEdit: {
        id: 'produtoEdit',
        allowedRoles: [roles.admin, roles.empresa, roles.pessoa],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
        allowedStorage: [
          storage.produtoFotos,
        ],
      },
      produtoDestroy: {
        id: 'produtoDestroy',
        allowedRoles: [roles.admin, roles.empresa],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
        allowedStorage: [
          storage.produtoFotos,
        ],
      },
      produtoRead: {
        id: 'produtoRead',
        allowedRoles: [roles.admin, roles.empresa, roles.pessoa],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
      },
      produtoAutocomplete: {
        id: 'produtoAutocomplete',
        allowedRoles: [roles.admin, roles.empresa, roles.pessoa],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
      },

      pedidoImport: {
        id: 'pedidoImport',
        allowedRoles: [roles.admin],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
      },
      pedidoCreate: {
        id: 'pedidoCreate',
        allowedRoles: [roles.admin, roles.pessoa],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
        allowedStorage: [

        ],
      },
      pedidoEdit: {
        id: 'pedidoEdit',
        allowedRoles: [roles.admin, roles.empresa, roles.pessoa],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
        allowedStorage: [

        ],
      },
      pedidoDestroy: {
        id: 'pedidoDestroy',
        allowedRoles: [roles.admin, roles.pessoa],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
        allowedStorage: [

        ],
      },
      pedidoRead: {
        id: 'pedidoRead',
        allowedRoles: [roles.admin, roles.empresa, roles.pessoa],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
      },
      pedidoAutocomplete: {
        id: 'pedidoAutocomplete',
        allowedRoles: [roles.admin, roles.pessoa],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
      },
     pedidoProdutoCreate: {
        id: 'pedidoProdutoCreate',
        allowedRoles: [roles.admin, roles.empresa, roles.pessoa],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
      },
      pedidoProdutoEdit: {
        id: 'pedidoProdutoEdit',
        allowedRoles: [roles.admin, roles.empresa, roles.pessoa],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
      },
      pedidoProdutoDestroy: {
        id: 'pedidoProdutoDestroy',
        allowedRoles: [roles.admin, roles.empresa, roles.pessoa],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
      },
      pedidoProdutoRead: {
        id: 'pedidoProdutoRead',
        allowedRoles: [roles.admin, roles.empresa, roles.pessoa],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
      },
      carrinhoImport: {
        id: 'carrinhoImport',
        allowedRoles: [roles.admin, roles.pessoa, roles.empresa],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
      },
      carrinhoCreate: {
        id: 'carrinhoCreate',
        allowedRoles: [roles.admin, roles.pessoa, roles.empresa],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
        allowedStorage: [

        ],
      },
      carrinhoEdit: {
        id: 'carrinhoEdit',
        allowedRoles: [roles.admin, roles.pessoa, roles.empresa],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
        allowedStorage: [

        ],
      },
      carrinhoDestroy: {
        id: 'carrinhoDestroy',
        allowedRoles: [roles.admin, roles.pessoa, roles.empresa],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
        allowedStorage: [

        ],
      },
      
      carrinhoProdutoImport: {
        id: 'carrinhoProdutoImport',
        allowedRoles: [roles.admin],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
      },
      carrinhoProdutoCreate: {
        id: 'carrinhoProdutoCreate',
        allowedRoles: [roles.admin, roles.pessoa, roles.empresa],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
        allowedStorage: [

        ],
      },
      carrinhoProdutoEdit: {
        id: 'carrinhoProdutoEdit',
        allowedRoles: [roles.admin, roles.pessoa, roles.empresa],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
        allowedStorage: [

        ],
      },
      carrinhoProdutoUpdate: {
        id: 'carrinhoProdutoUpdate',
        allowedRoles: [roles.admin],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
      },
      carrinhoProdutoDestroy: {
        id: 'carrinhoProdutoDestroy',
        allowedRoles: [roles.admin, roles.pessoa, roles.empresa],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
        allowedStorage: [

        ],
      },
      carrinhoProdutoRead: {
        id: 'carrinhoProdutoRead',
        allowedRoles: [roles.admin, roles.pessoa, roles.empresa],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
      },
      carrinhoProdutoAutocomplete: {
        id: 'carrinhoProdutoAutocomplete',
        allowedRoles: [roles.admin, roles.pessoa, roles.empresa],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
      },

      carrinhoRead: {
        id: 'carrinhoRead',
        allowedRoles: [roles.admin, roles.pessoa, roles.empresa],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
      },
      carrinhoAutocomplete: {
        id: 'carrinhoAutocomplete',
        allowedRoles: [roles.admin, roles.pessoa, roles.empresa],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
      },

      categoriaImport: {
        id: 'categoriaImport',
        allowedRoles: [roles.admin, roles.empresa],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
      },
      categoriaCreate: {
        id: 'categoriaCreate',
        allowedRoles: [roles.admin, roles.empresa],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
        allowedStorage: [

        ],
      },
      categoriaEdit: {
        id: 'categoriaEdit',
        allowedRoles: [roles.admin, roles.empresa],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
        allowedStorage: [

        ],
      },
      categoriaDestroy: {
        id: 'categoriaDestroy',
        allowedRoles: [roles.admin, roles.empresa],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
      },
      categoriaRead: {
        id: 'categoriaRead',
        allowedRoles: [roles.admin, roles.empresa, roles.pessoa],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
      },
      categoriaAutocomplete: {
        id: 'categoriaAutocomplete',
        allowedRoles: [roles.admin, roles.empresa, roles.pessoa],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
      },
      
      comentarioCreate: {
        id: 'comentarioCreate',
        allowedRoles: [roles.admin, roles.pessoa],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
      },
      comentarioEdit: {
        id: 'comentarioEdit',
        allowedRoles: [roles.admin, roles.pessoa],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
      },
      comentarioDestroy: {
        id: 'comentarioDestroy',
        allowedRoles: [roles.admin, roles.pessoa],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
      },
      comentarioRead: {
        id: 'comentarioRead',
        allowedRoles: [roles.admin, roles.empresa, roles.pessoa],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
      },
      informacoesImport: {
        id: 'informacoesImport',
        allowedRoles: [roles.admin],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
      },
      informacoesCreate: {
        id: 'informacoesCreate',
        allowedRoles: [roles.admin, roles.empresa],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],

      },
      informacoesEdit: {
        id: 'informacoesEdit',
        allowedRoles: [roles.admin, roles.empresa, roles.pessoa],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
      },
      informacoesDestroy: {
        id: 'informacoesDestroy',
        allowedRoles: [roles.admin, roles.empresa],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],

      },
      informacoesRead: {
        id: 'informacoesRead',
        allowedRoles: [roles.admin, roles.empresa, roles.pessoa],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
      },
      informacoesAutocomplete: {
        id: 'informacoesAutocomplete',
        allowedRoles: [roles.admin, roles.empresa, roles.pessoa],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
      },
      // ImagemCreate: {
      //   id: 'ImagemCreate',
      //   allowedRoles: [roles.admin],
      //   allowedPlans: [plans.free, plans.growth, plans.enterprise],
      // },
      termosImport: {
        id: 'termosImport',
        allowedRoles: [roles.admin],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
      },
      termosCreate: {
        id: 'termosCreate',
        allowedRoles: [roles.admin, roles.empresa],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],

      },
      termosEdit: {
        id: 'termosEdit',
        allowedRoles: [roles.admin, roles.empresa, roles.pessoa],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
      },
      termosDestroy: {
        id: 'termosDestroy',
        allowedRoles: [roles.admin, roles.empresa],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],

      },
      termosRead: {
        id: 'termosRead',
        allowedRoles: [roles.admin, roles.empresa, roles.pessoa],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
      },
      termosAutocomplete: {
        id: 'termosAutocomplete',
        allowedRoles: [roles.admin, roles.empresa, roles.pessoa],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
      },
      // ImagemCreate: {
      //   id: 'ImagemCreate',
      //   allowedRoles: [roles.admin],
      //   allowedPlans: [plans.free, plans.growth, plans.enterprise],
      // },
      bannersImport: {
        id: 'bannersImport',
        allowedRoles: [roles.admin],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
      },
      bannersCreate: {
        id: 'bannersCreate',
        allowedRoles: [roles.admin, roles.empresa],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
        allowedStorage: [
          storage.bannersFotos,
        ],
      },
      bannersEdit: {
        id: 'bannersEdit',
        allowedRoles: [roles.admin, roles.empresa, roles.pessoa],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
        allowedStorage: [
          storage.bannersFotos,
        ],
      },
      bannersDestroy: {
        id: 'bannersDestroy',
        allowedRoles: [roles.admin, roles.empresa],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
        allowedStorage: [
          storage.bannersFotos,
        ],
      },
      bannersRead: {
        id: 'bannersRead',
        allowedRoles: [roles.admin, roles.empresa, roles.pessoa],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
      },
      bannersAutocomplete: {
        id: 'bannersAutocomplete',
        allowedRoles: [roles.admin, roles.empresa, roles.pessoa],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
      },
    };
  }

  static get asArray() {
    return Object.keys(this.values).map((value) => {
      return this.values[value];
    });
  }
}

export default Permissions;
