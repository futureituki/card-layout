'use client';

import { max, min } from 'lodash';
import '@/components/shard/Parent/style.css'
import {
  MouseEvent,
  ReactNode,
  TouchEvent,
  useEffect,
  useCallback,
  useRef,
  useState,
  WheelEvent
} from 'react';

export enum ScrollState {
  None = 'none',
  Wheel = 'wheel',
  Start = 'start',
  Scrolling = 'scrolling',
  End = 'end',
  Inertia = 'inertia'
}

export type TypeScrollState = ScrollState.None | ScrollState.Wheel | ScrollState.Start | ScrollState.Scrolling | ScrollState.End | ScrollState.Inertia;

const wheelTimerDilay = 150;

export function LoopScrollView({
  children,
  canScroll = true,
  progress = 10,
  onChangeProgress = () => {},
  onChangeScrollState = () => {},
  maxDiffYListLength = 2,
  scrollRatio = -10,
  inertialForceRatio = .1
}: {
  children?: ReactNode;
  canScroll?: boolean;
  progress?: number;
  onChangeProgress?: (progress: number) => void;
  onChangeScrollState? : (scrollState: TypeScrollState) => void;
  maxDiffYListLength? : number;
  scrollRatio?: number;
  inertialForceRatio?: number;
}) {
  const wheelTimerRef = useRef<number>(-1);
  const requestIdRef = useRef<number>(-1);
  const scrollStateRef = useRef<TypeScrollState>(ScrollState.None);
  const innerProgressRef = useRef<number>(progress * 100);
  const startYRef = useRef<number>(0);
  const lastCurrentYRef = useRef<number>(0);
  const currentYRef = useRef<number>(0);
  const diffYListRef = useRef<number[]>([]);
  const inertialForceRef = useRef<number>(0);
  const [ scrollState, setScrollState ] = useState<TypeScrollState>(scrollStateRef.current);
  const [ _delta, setDelta ] = useState(0);

  useEffect(() => {
    innerProgressRef.current = progress * 100;
  }, [progress]);

  useEffect(() => {
    checkInertia(0);

    return () => {
      cancelAnimationFrame(requestIdRef.current);
    };
  }, [scrollRatio]);

  useEffect(() => {
    onChangeScrollState(scrollState);
  }, [scrollState]);

  // 右クリックを禁止する（スマホの長押しも同時に禁止となる）
  const handleContextMenu = useCallback((evt: MouseEvent<HTMLDivElement>) => {
    evt.preventDefault();
  }, []);

  // マウスホイールでもスクロールするようにしておく
  const handleWheel = useCallback((evt: WheelEvent<HTMLDivElement>) => {
    if (!canScroll) {
      return;
    }

    scrollStateRef.current = ScrollState.Wheel;
    setScrollState(scrollStateRef.current);
    innerProgressRef.current = (innerProgressRef.current + evt.deltaY * scrollRatio) % 80;

    clearTimeout(wheelTimerRef.current);
    wheelTimerRef.current = window.setTimeout(() => {
      scrollStateRef.current = ScrollState.None;
      setScrollState(scrollStateRef.current);
    }, wheelTimerDilay);
  }, [canScroll, scrollRatio]);

  const handleMouseDown = useCallback((evt: MouseEvent<HTMLDivElement>) => {
    handlePointerStart(evt.screenY);
  }, []);

  const handleTouchStart = useCallback((evt: TouchEvent<HTMLDivElement>) => {
    handlePointerStart(evt.touches[0].screenY);
  }, [canScroll]);

  const handlePointerStart = useCallback((y: number) => {
    if (!canScroll) {
      return;
    }

    scrollStateRef.current = ScrollState.Start;
    setScrollState(scrollStateRef.current);
    startYRef.current = y;
    diffYListRef.current = (new Array(maxDiffYListLength)); // 慣性力でスクロールしている最中も画面にタッチしたら止まるようにしておく
    lastCurrentYRef.current = currentYRef.current = startYRef.current;
  }, [canScroll]);

  const handleMouseMove = useCallback((evt: MouseEvent<HTMLDivElement>) => {
    handlePointerMove(evt.screenY);
  }, [canScroll]);

  const handleTouchMove = useCallback((evt: TouchEvent<HTMLDivElement>) => {
    handlePointerMove(evt.touches[0].screenY);
  }, [canScroll]);

  const handlePointerMove = useCallback((y: number) => {
    if (!canScroll) {
      return;
    }

    if (scrollStateRef.current === ScrollState.Start || scrollStateRef.current === ScrollState.Scrolling) {
      scrollStateRef.current = ScrollState.Scrolling;
      setScrollState(scrollStateRef.current);
      currentYRef.current = y;
    }
  }, [canScroll]);

  const handleMouseUp = useCallback(() => {
    handlePointerEnd();
  }, [canScroll]);

  const handleTouchEnd = useCallback(() => {
    handlePointerEnd();
  }, [canScroll]);

  const handlePointerEnd = useCallback(() => {
    if (!canScroll) {
      return;
    }

    scrollStateRef.current = ScrollState.Inertia;
    setScrollState(scrollStateRef.current);
  }, [canScroll]);

  const getInertialForce = useCallback((diffYList: number[]) => {
    let maxDiffY = max(diffYList) || 0;

    if (maxDiffY === 0) {
      maxDiffY = min(diffYList) || 0;
    }

    return maxDiffY * scrollRatio;
  }, [scrollRatio]);

  const getProgress = useCallback((innerProgress: number) => {
    if (innerProgress < 0) {
      return 1 + innerProgress;
    }

    return innerProgress;
  }, []);

  const checkInertia = useCallback((delta: number) => {
    switch (scrollStateRef.current) {
      case ScrollState.Wheel:
        setDelta(delta % 1000);
        break;
      case ScrollState.Scrolling:
        if (maxDiffYListLength <= diffYListRef.current.length) {
          diffYListRef.current.shift();
        }
        const diffY = lastCurrentYRef.current - currentYRef.current;

        diffYListRef.current.push(diffY);
        inertialForceRef.current = getInertialForce(diffYListRef.current);
        innerProgressRef.current = (innerProgressRef.current + diffY * scrollRatio) % 100;
        lastCurrentYRef.current = currentYRef.current;

        setDelta(delta % 1000);
        break;
      case ScrollState.Inertia:
        if (getInertialForce(diffYListRef.current)) {
          inertialForceRef.current *= (1 - inertialForceRatio); // 慣性を徐々に弱める
          innerProgressRef.current = (innerProgressRef.current + inertialForceRef.current) % 100;

          if (Math.abs(inertialForceRef.current) < inertialForceRatio) {
            scrollStateRef.current = ScrollState.None;
            setScrollState(scrollStateRef.current);
            inertialForceRef.current = 0;
          }

          setDelta(delta % 1000);
        } else {
          scrollStateRef.current = ScrollState.None;
          setScrollState(scrollStateRef.current);
          inertialForceRef.current = 0;
        }
        break;
    }

    if (scrollStateRef.current !== ScrollState.None) {
      onChangeProgress(getProgress(innerProgressRef.current / 100));
    }

    // 毎フレーム慣性を計算する
    requestIdRef.current = requestAnimationFrame(checkInertia);
  }, [scrollRatio]);

  return (
    <div>
      <div
        onWheel={ handleWheel }
        onContextMenu={ handleContextMenu }
        onMouseDown={ handleMouseDown }
        onMouseMove={ handleMouseMove }
        onMouseUp={ handleMouseUp }
        onTouchStart={ handleTouchStart }
        onTouchMove={ handleTouchMove }
        onTouchEnd={ handleTouchEnd }
      >
        { children }
      </div>
    </div>
  );
}
