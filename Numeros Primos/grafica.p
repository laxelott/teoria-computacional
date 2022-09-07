set title "Numeros primos"
set xlabel "Numero"
set ylabel "Unos"

set terminal png size 1200, 800
set output 'primos.png'

set xrange [-100:850000]
set yrange [0:20]

plot "primos.dat" using 1:2 title "Unos" with linespoints ls 1 lw 1.5 pt 7 ps 1,\
	 "primos.dat" using 1:3  title "Logaritmo 2" with linespoints ls 2 lw 1.5 pt 7 ps 1,\
	 "primos.dat" using 1:4  title "Logaritmo 10" with linespoints ls 3 lw 1.5 pt 7 ps 1