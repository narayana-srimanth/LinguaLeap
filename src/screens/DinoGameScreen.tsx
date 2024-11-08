import React from 'react'
import Game from '../components/DinoGame_Game';
import Leaderboard from '../components/DinoGame_Leaderboard';
const DinoGameScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100">
      <div className="max-w-8xl max-h-5xl p-8">
        <div className="grid lg:grid-cols-8 gap-8">
          <div className="lg:col-span-6">
            <Game />
          </div>
          <div className="lg:col-span-2">
            <Leaderboard />
          </div>
        </div>
      </div>
    </div>
  )
}

export default DinoGameScreen