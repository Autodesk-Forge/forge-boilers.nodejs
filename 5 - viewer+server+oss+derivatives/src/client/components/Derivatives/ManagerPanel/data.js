
const Formats = {
  "dwg": [
    "f2d", "f3d", "rvt"
  ],
  "fbx": [
    "f3d"
  ],
  "ifc": [
    "rvt"
  ],
  "iges": [
    "f3d", "fbx", "iam", "ipt", "wire"
  ],
  "obj": [
    "f3d", "fbx", "iam", "ipt", "step", "stp",
    "stpz", "wire","rvt", "dwf", "dwfx", "nwc"
  ],
  "step": [
    "f3d", "fbx", "iam", "ipt", "wire"
  ],
  "stl": [
    "f3d", "fbx", "iam", "ipt", "wire"
  ],
  "svf": [
    "3dm",
    "3ds",
    "asm",
    "catpart",
    "catproduct",
    "cgr",
    "collaboration",
    "dae",
    "dgn",
    "dlv3",
    "dwf",
    "dwfx",
    "dwg",
    "dwt",
    "dxf",
    "exp",
    "f3d",
    "fbx",
    "g",
    "gbxml",
    "iam",
    "idw",
    "ifc",
    "ige",
    "iges",
    "igs",
    "ipt",
    "jt",
    "max",
    "model",
    "neu",
    "nwc",
    "nwd",
    "obj",
    "pdf",
    "prt",
    "rcp",
    "rvt",
    "sab",
    "sat",
    "session",
    "skp",
    "sldasm",
    "sldprt",
    "smb",
    "smt",
    "ste",
    "step",
    "stl",
    "stla",
    "stlb",
    "stp",
    "stpz",
    "wire",
    "x_b",
    "x_t",
    "xas",
    "xpr",
    "zip",
    "asm\\.\\d+$",
    "neu\\.\\d+$",
    "prt\\.\\d+$"
  ]
}

const Payloads = {
  stl: {
    input:{},
    output:{
      force: true,
      formats: [{
        type: 'stl'
      }],
      destination: {
        region: 'us'
      }
    }
  },
  step: {
    input:{},
    output:{
      force: true,
      formats: [{
        type: 'step'
      }],
      destination: {
        region: 'us'
      }
    }
  },
  dwg: {
    input:{},
    output:{
      force: true,
      formats: [{
        type: 'dwg'
      }],
      destination: {
        region: 'us'
      }
    }
  },
  iges: {
    input:{},
    output:{
      force: true,
      formats: [{
        type: 'iges'
      }],
      destination: {
        region: 'us'
      }
    }
  },
  obj: {
    input:{},
    output:{
      force: false,
      formats: [{
        type: 'obj',
        advanced: {
          objectIds: [-1]
        }
      }],
      destination: {
        region: 'us'
      }
    }
  },
  svf: {
    input:{},
    output:{
      force: true,
      formats: [{
        type: 'svf',
        views: ['2d', '3d']
      }],
      destination: {
        region: 'us'
      }
    }
  },
  fbx: {
    input:{

    },
    output:{
      force: true,
      formats: [{
        type: 'fbx'
      }],
      destination: {
        region: 'us'
      }
    }
  },
  ifc: {
    input:{

    },
    output:{
      force: true,
      formats: [{
        type: 'ifc'
      }],
      destination: {
        region: 'us'
      }
    }
  }
}

module.exports = {
  Payloads,
  Formats
}