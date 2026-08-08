'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

interface Board3DProps {
  fen?: string;
  theme?: string;
  onSquareClick?: (square: string) => void;
  onPieceMove?: (from: string, to: string) => void;
  legalMoves?: string[];
  selectedSquare?: string;
  isEnabled?: boolean;
  playSound?: boolean;
}

const Board3D: React.FC<Board3DProps> = ({
  fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  theme = 'classic',
  onSquareClick,
  onPieceMove,
  legalMoves = [],
  selectedSquare,
  isEnabled = true,
  playSound = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const piecesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const squaresRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const [boardState, setBoardState] = useState<any[][]>([]);
  const [draggedPiece, setDraggedPiece] = useState<{ square: string; offset: THREE.Vector3 } | null>(null);
  const dragPlaneRef = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const dragPointRef = useRef(new THREE.Vector3());

  const THEMES: Record<string, { light: number; dark: number }> = {
    classic: { light: 0xf0d9b5, dark: 0xb58863 },
    blue: { light: 0xbaca44, dark: 0x6d94f7 },
    green: { light: 0xbaca44, dark: 0x7cb342 },
    wood: { light: 0xd2b48c, dark: 0x8b4513 },
    dark: { light: 0x404040, dark: 0x1a1a1a }
  };

  const currentTheme = THEMES[theme] || THEMES.classic;

  const parseFEN = (fenString: string): any[][] => {
    const board: any[][] = [];
    const rows = fenString.split(' ')[0].split('/');

    for (let row = 0; row < 8; row++) {
      const boardRow = [];
      let col = 0;

      for (const char of rows[row]) {
        if (isNaN(Number(char))) {
          const color = char === char.toUpperCase() ? 'white' : 'black';
          boardRow.push({
            type: char.toLowerCase(),
            color,
            position: { x: col, y: 7 - row }
          });
          col++;
        } else {
          for (let i = 0; i < parseInt(char); i++) {
            boardRow.push(null);
            col++;
          }
        }
      }

      board.push(boardRow);
    }

    return board;
  };

  const positionToSquare = (x: number, y: number): string => {
    const col = String.fromCharCode(97 + x);
    const row = 8 - y;
    return `${col}${row}`;
  };

  const createPieceMesh = (type: string, color: string): THREE.Mesh => {
    const geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const material = new THREE.MeshPhongMaterial({
      color: color === 'white' ? 0xffffff : 0x333333,
      emissive: 0x000000,
      shininess: 100
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = { type, color };
    return mesh;
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    sceneRef.current = scene;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(4, 6, 4);
    camera.lookAt(3.5, 0, 3.5);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const isLight = (row + col) % 2 === 0;
        const color = isLight ? currentTheme.light : currentTheme.dark;

        const geometry = new THREE.PlaneGeometry(1, 1);
        const material = new THREE.MeshPhongMaterial({ color, side: THREE.DoubleSide });
        const square = new THREE.Mesh(geometry, material);
        square.rotation.x = -Math.PI / 2;
        square.position.set(col, 0.001, row);
        square.receiveShadow = true;
        square.userData = { square: positionToSquare(col, row) };
        scene.add(square);

        squaresRef.current.set(positionToSquare(col, row), square);
      }
    }

    const handleResize = () => {
      const newWidth = containerRef.current?.clientWidth || width;
      const newHeight = containerRef.current?.clientHeight || height;
      (camera as THREE.PerspectiveCamera).aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [currentTheme]);

  useEffect(() => {
    const newBoardState = parseFEN(fen);
    setBoardState(newBoardState);
  }, [fen]);

  useEffect(() => {
    if (!sceneRef.current || boardState.length === 0) return;

    piecesRef.current.forEach((mesh) => {
      sceneRef.current?.remove(mesh);
    });
    piecesRef.current.clear();

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = boardState[row]?.[col];
        if (piece) {
          const mesh = createPieceMesh(piece.type, piece.color);
          mesh.position.set(col, 0.5, row);
          sceneRef.current.add(mesh);

          const square = positionToSquare(col, row);
          piecesRef.current.set(square, mesh);
        }
      }
    }
  }, [boardState]);

  useEffect(() => {
    squaresRef.current.forEach((square, squareName) => {
      const isSelected = squareName === selectedSquare;
      const isLegal = legalMoves.includes(squareName);

      const material = square.material as THREE.MeshPhongMaterial;
      if (isSelected) {
        material.emissive.setHex(0xffff00);
        material.emissiveIntensity = 0.3;
      } else if (isLegal) {
        material.emissive.setHex(0x00ff00);
        material.emissiveIntensity = 0.2;
      } else {
        material.emissive.setHex(0x000000);
        material.emissiveIntensity = 0;
      }
    });
  }, [selectedSquare, legalMoves]);

  const onMouseDown = useCallback(
    (event: MouseEvent) => {
      if (!isEnabled || !cameraRef.current || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);

      const pieces = Array.from(piecesRef.current.values());
      const intersects = raycasterRef.current.intersectObjects(pieces);

      if (intersects.length > 0) {
        const mesh = intersects[0].object as THREE.Mesh;
        const square = Array.from(piecesRef.current.entries()).find(([_, m]) => m === mesh)?.[0];

        if (square) {
          setDraggedPiece({
            square,
            offset: new THREE.Vector3().copy(mesh.position)
          });
        }
      }
    },
    [isEnabled]
  );

  const onMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!draggedPiece || !cameraRef.current || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      raycasterRef.current.ray.intersectPlane(dragPlaneRef.current, dragPointRef.current);

      const mesh = piecesRef.current.get(draggedPiece.square);
      if (mesh) {
        mesh.position.copy(dragPointRef.current);
        mesh.position.y = 0.5;
      }
    },
    [draggedPiece]
  );

  const onMouseUp = useCallback(
    (event: MouseEvent) => {
      if (!draggedPiece || !cameraRef.current || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);

      const squares = Array.from(squaresRef.current.values());
      const intersects = raycasterRef.current.intersectObjects(squares);

      const mesh = piecesRef.current.get(draggedPiece.square);
      if (mesh) {
        if (intersects.length > 0) {
          const targetSquare = (intersects[0].object as THREE.Mesh).userData.square;

          if (targetSquare !== draggedPiece.square) {
            onPieceMove?.(draggedPiece.square, targetSquare);
            playSound && playMoveSound();
          }
        }
        mesh.position.copy(draggedPiece.offset);
      }

      setDraggedPiece(null);
    },
    [draggedPiece, onPieceMove, playSound]
  );

  const onMouseClick = useCallback(
    (event: MouseEvent) => {
      if (draggedPiece || !isEnabled || !cameraRef.current || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);

      const squares = Array.from(squaresRef.current.values());
      const intersects = raycasterRef.current.intersectObjects(squares);

      if (intersects.length > 0) {
        const square = (intersects[0].object as THREE.Mesh).userData.square;
        onSquareClick?.(square);
      }
    },
    [isEnabled, draggedPiece, onSquareClick]
  );

  const playMoveSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 400;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
      // Audio not supported
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('mousedown', onMouseDown);
    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mouseup', onMouseUp);
    container.addEventListener('click', onMouseClick);

    return () => {
      container.removeEventListener('mousedown', onMouseDown);
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('click', onMouseClick);
    };
  }, [onMouseDown, onMouseMove, onMouseUp, onMouseClick]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{
        minHeight: '600px',
        touchAction: 'none',
        cursor: isEnabled ? (draggedPiece ? 'grabbing' : 'grab') : 'not-allowed'
      }}
    />
  );
};

export default Board3D;
