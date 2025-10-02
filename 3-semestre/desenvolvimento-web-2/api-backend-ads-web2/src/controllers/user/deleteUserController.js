const deleteUserController = (req, res) => {
    res.json({
      message: "usuario deletado",
      user: "tulio",
      email:"tulio.y",
      avatar: "https://github.com/tuliokenji.png"
    })
  }

export default deleteUserController