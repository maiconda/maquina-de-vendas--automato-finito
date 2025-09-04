"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, Coins, ArrowRight, RotateCcw, CheckCircle, Zap } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Definição dos estados do autômato
type State = 0 | 5 | 10 | 15 | 20 | 25 | 30
type Coin = 5 | 10 | 25

interface Transition {
  from: State
  to: State
  input: Coin
  timestamp: number
}

interface AutomatonState {
  current: State
  isAccepting: boolean
  canDispense: boolean
}

const STATES: State[] = [0, 5, 10, 15, 20, 25, 30]
const COINS: Coin[] = [5, 10, 25]
const PRODUCT_PRICE = 30

export default function VendingMachineAutomaton() {
  const [currentState, setCurrentState] = useState<State>(0)
  const [transitions, setTransitions] = useState<Transition[]>([])
  const [insertedCoins, setInsertedCoins] = useState<Coin[]>([])
  const [change, setChange] = useState<number>(0)
  const [productDispensed, setProductDispensed] = useState<boolean>(false)
  const [animatingTransition, setAnimatingTransition] = useState<boolean>(false)

  // Função de transição do autômato
  const transition = (state: State, coin: Coin): State => {
    const newValue = state + coin
    return newValue >= 30 ? 30 : (newValue as State)
  }

  // Verifica se o estado é de aceitação (pode dispensar produto)
  const isAcceptingState = (state: State): boolean => state >= 30

  // Inserir moeda
  const insertCoin = async (coin: Coin) => {
    if (productDispensed) return

    setAnimatingTransition(true)

    const newState = transition(currentState, coin)
    const newTransition: Transition = {
      from: currentState,
      to: newState,
      input: coin,
      timestamp: Date.now(),
    }

    // Simular animação de transição
    await new Promise((resolve) => setTimeout(resolve, 500))

    setCurrentState(newState)
    setTransitions((prev) => [...prev, newTransition])
    setInsertedCoins((prev) => [...prev, coin])
    setAnimatingTransition(false)

    // Calcular troco se necessário
    if (newState >= 30) {
      const totalInserted = [...insertedCoins, coin].reduce((sum, c) => sum + c, 0)
      setChange(totalInserted - PRODUCT_PRICE)
    }
  }

  // Dispensar produto
  const dispenseProduct = () => {
    if (currentState >= 30) {
      setProductDispensed(true)
    }
  }

  // Reset da máquina
  const resetMachine = () => {
    setCurrentState(0)
    setTransitions([])
    setInsertedCoins([])
    setChange(0)
    setProductDispensed(false)
  }

  // Obter cor do estado
  const getStateColor = (state: State) => {
    if (state === currentState && animatingTransition) return "bg-accent animate-pulse"
    if (state === currentState) return "bg-primary text-primary-foreground"
    if (isAcceptingState(state)) return "bg-secondary text-secondary-foreground"
    return "bg-muted text-muted-foreground"
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Máquina de Vendas - Autômato Finito</h1>
          <p className="text-muted-foreground text-lg">Simulador Interativo para Linguagens Formais e Autômatos</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Diagrama do Autômato */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Diagrama de Estados
              </CardTitle>
              <CardDescription>Estados do autômato (centavos acumulados). Estado inicial: q₀ = 0¢</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 mb-6">
                {STATES.map((state) => (
                  <div key={state} className="flex flex-col items-center space-y-2">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${getStateColor(state)}`}
                    >
                      q{STATES.indexOf(state)}
                    </div>
                    <div className="text-xs text-center">
                      <div className="font-medium">{state}¢</div>
                      {isAcceptingState(state) && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          Final
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Função de Transição */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Função de Transição δ(q, a):</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs font-mono">
                  {COINS.map((coin) => (
                    <div key={coin} className="space-y-1">
                      <div className="font-semibold text-accent">Moeda {coin}¢:</div>
                      {STATES.slice(0, -1).map((state) => {
                        const nextState = transition(state, coin)
                        return (
                          <div key={state} className="flex items-center gap-1">
                            <span>
                              δ(q{STATES.indexOf(state)}, {coin}¢) = q{STATES.indexOf(nextState)}
                            </span>
                            <ArrowRight className="h-3 w-3" />
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Painel de Controle */}
          <div className="space-y-4">
            {/* Estado Atual */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estado Atual</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    q{STATES.indexOf(currentState)} = {currentState}¢
                  </div>
                  {isAcceptingState(currentState) && (
                    <Badge variant="secondary" className="mt-2">
                      Estado de Aceitação
                    </Badge>
                  )}
                </div>

                {productDispensed ? (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>Produto dispensado! Troco: {change}¢</AlertDescription>
                  </Alert>
                ) : isAcceptingState(currentState) ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>Valor suficiente! Troco será: {change}¢</AlertDescription>
                  </Alert>
                ) : (
                  <Alert>
                    <Coins className="h-4 w-4" />
                    <AlertDescription>Faltam {PRODUCT_PRICE - currentState}¢ para o produto</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Inserir Moedas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Inserir Moedas</CardTitle>
                <CardDescription>Alfabeto Σ = {"{5¢, 10¢, 25¢}"}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {COINS.map((coin) => (
                  <Button
                    key={coin}
                    onClick={() => insertCoin(coin)}
                    disabled={productDispensed || animatingTransition}
                    className="w-full"
                    variant="outline"
                  >
                    Inserir {coin}¢
                  </Button>
                ))}

                <Separator />

                {isAcceptingState(currentState) && !productDispensed && (
                  <Button onClick={dispenseProduct} className="w-full" disabled={animatingTransition}>
                    Dispensar Produto
                  </Button>
                )}

                <Button
                  onClick={resetMachine}
                  variant="outline"
                  className="w-full bg-transparent"
                  disabled={animatingTransition}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </CardContent>
            </Card>

            {/* Informações do Autômato */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Especificação Formal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm font-mono">
                <div>
                  <strong>M =</strong> (Q, Σ, δ, q₀, F)
                </div>
                <div>
                  <strong>Q =</strong> {"{q₀, q₁, q₂, q₃, q₄, q₅, q₆}"}
                </div>
                <div>
                  <strong>Σ =</strong> {"{5¢, 10¢, 25¢}"}
                </div>
                <div>
                  <strong>q₀ =</strong> q₀ (0¢)
                </div>
                <div>
                  <strong>F =</strong> {"{q₆}"} (≥30¢)
                </div>
                <div>
                  <strong>Preço:</strong> 30¢
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Histórico de Transições */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Transições</CardTitle>
            <CardDescription>Sequência de transições executadas: δ*(q₀, w) onde w ∈ Σ*</CardDescription>
          </CardHeader>
          <CardContent>
            {transitions.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Nenhuma transição executada ainda</p>
            ) : (
              <div className="space-y-2">
                <div className="text-sm font-semibold mb-3">Palavra de entrada: {insertedCoins.join("¢, ")}¢</div>
                <div className="grid gap-2">
                  {transitions.map((trans, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg text-sm font-mono">
                      <span className="font-semibold">#{index + 1}</span>
                      <span>
                        δ(q{STATES.indexOf(trans.from)}, {trans.input}¢)
                      </span>
                      <ArrowRight className="h-4 w-4" />
                      <span>q{STATES.indexOf(trans.to)}</span>
                      <span className="text-muted-foreground">
                        ({trans.from}¢ → {trans.to}¢)
                      </span>
                    </div>
                  ))}
                </div>
                {productDispensed && (
                  <div className="mt-4 p-3 bg-secondary rounded-lg text-sm">
                    <strong>Resultado:</strong> Palavra aceita! Produto dispensado com troco de {change}¢
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
