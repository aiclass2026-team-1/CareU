<script setup lang="ts">
/**
 * Care U｜品牌 U 型 Logo 向量圖標 (Brand Mark)
 *
 * 來源：source/assets/brand/vis/ 與官方 VIS 規範
 * 規格：viewBox="0 0 300 378.011"
 */
withDefaults(
  defineProps<{
    animateDot?: boolean
    dotClass?: string
    blueColor?: string
    dotColor?: string
  }>(),
  {
    animateDot: false,
    dotClass: 'logo-dot',
    blueColor: '#197afc',
    dotColor: '#fb8f54',
  }
)
</script>

<template>
  <svg
    viewBox="0 0 300 378.011"
    role="img"
    aria-label="Care U Logo"
  >
    <path
      d="M299.989,90.76c-7.253,0-10.187-.218-19.47.2-36.608,1.65-54.184,25.083-54.938,61.78-.565,27.517.078,55.1-1.162,82.57C222.757,272.145,188.034,303.75,150,303.75s-72.757-31.605-74.419-68.439c-1.24-27.475-.6-55.053-1.162-82.57-.754-36.7-18.33-60.13-54.938-61.78-9.283-.419-12.217-.2-19.47-.2C.011,177.278-.43,225.7,4.25,256.881,13.5,318.511,66.564,378.011,150,378.011s136.5-59.5,145.75-121.13C300.43,225.7,299.989,177.278,299.989,90.76Z"
      :fill="blueColor"
    />
    <circle
      :class="[dotClass, { 'is-animating': animateDot }]"
      cx="150"
      cy="54.1"
      r="54.1"
      :fill="dotColor"
    />
    <path
      d="M184.782,187.729H167V169.947a17,17,0,0,0-34,0v17.782h-17.78a17,17,0,1,0,0,34H133v17.783a17,17,0,0,0,34,0V221.729h17.779a17,17,0,1,0,0-34Z"
      :fill="blueColor"
    />
  </svg>
</template>
