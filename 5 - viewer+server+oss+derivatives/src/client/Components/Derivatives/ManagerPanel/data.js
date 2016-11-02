
const Formats = {
  "stl": [
    "f3d",
    "fbx",
    "iam",
    "ipt",
    "wire"
  ],
    "step": [
    "f3d",
    "fbx",
    "iam",
    "ipt",
    "wire"
  ],
    "dwg": [
    "f2d",
    "f3d",
    "rvt"
  ],
    "iges": [
    "f3d",
    "fbx",
    "iam",
    "ipt",
    "wire"
  ],
    "obj": [
    "f3d",
    "fbx",
    "iam",
    "ipt",
    "step",
    "stp",
    "stpz",
    "wire"
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
  ],
    "thumbnail": [
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
  ],
    "fbx": [
    "f3d"
  ],
    "ifc": [
    "rvt"
  ]
}

const Payloads = {
  stl: {
    input:{},
    output:{}
  },
  step: {
    input:{},
    output:{}
  },
  dwg: {
    input:{},
    output:{}
  },
  iges: {
    input:{},
    output:{}
  },
  obj: {
    input:{},
    output:{}
  },
  svf: {
    input:{},
    output:{}
  },
  thumbnail: {
    input:{},
    output:{}
  },
  fbx: {
    input:{},
    output:{}
  },
  ifc: {
    input:{},
    output:{}
  }
}

module.exports = {
  Payloads,
  Formats
}