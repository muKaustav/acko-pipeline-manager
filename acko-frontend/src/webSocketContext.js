import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'

const WebSocketContext = createContext(null)

export const WebSocketProvider = ({ children }) => {
    const [pipelineUpdates, setPipelineUpdates] = useState({})
    const [isConnected, setIsConnected] = useState(false)
    const socketRef = useRef(null)

    const getWebSocketUrl = () => {
        return process.env.REACT_APP_WS_URL || `ws://localhost:8000/ws`
    }

    const connectWebSocket = useCallback(() => {
        const wsUrl = getWebSocketUrl()
        console.log('Attempting to connect to WebSocket:', wsUrl)
        const newSocket = new WebSocket(wsUrl)

        newSocket.onopen = () => {
            console.log('WebSocket connection established')
            setIsConnected(true)
        }

        newSocket.onmessage = (event) => {
            const data = JSON.parse(event.data)
            console.log('Received message from server:', data)

            if (data.type === 'pipelineUpdate') {
                setPipelineUpdates(prev => ({
                    ...prev,
                    [data.pipelineId]: {
                        status: data.status,
                        lastRunAt: data.lastRunAt,
                    }
                }))
            }
        }

        newSocket.onclose = () => {
            console.log('WebSocket connection closed')
            setIsConnected(false)
            setTimeout(connectWebSocket, 5000)
        }

        newSocket.onerror = (error) => {
            console.error('WebSocket error:', error)
        }

        socketRef.current = newSocket
    }, [])

    useEffect(() => {
        connectWebSocket()

        return () => {
            if (socketRef.current) {
                socketRef.current.close()
            }
        }
    }, [connectWebSocket])

    const sendMessage = useCallback((message) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify(message))
        } else {
            console.error('WebSocket is not connected')
        }
    }, [])

    const value = { sendMessage, pipelineUpdates, isConnected }

    return (
        <WebSocketContext.Provider value={value}>
            {children}
        </WebSocketContext.Provider>
    )
}

export const useWebSocket = () => {
    const context = useContext(WebSocketContext)
    if (!context) {
        throw new Error('useWebSocket must be used within a WebSocketProvider')
    }
    return context
}