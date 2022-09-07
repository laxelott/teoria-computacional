set title "Sigma"
set xlabel "X"
set ylabel "Y"

set terminal png size 1200, 800
set output 'sigma.png'

set xrange [-500:800000]
set yrange [0:50]

plot "grafica.dat" using 1:2 title "Unos" with linespoints ls 1 lw 1.5 pt 7 ps 1,\
	"grafica.dat" using 1:3 title "Logaritmo 2" with linespoints ls 2 lw 1.5 pt 7 ps 1,\
	"grafica.dat" using 1:4 title "Logaritmo 10" with linespoints ls 3 lw 1.5 pt 7 ps 1

set output 'sigma32.png'

set xrange [-500:800000]
set yrange [0:50]

plot "grafica32.dat" using 1:2 title "Unos" with linespoints ls 1 lw 1.5 pt 7 ps 1,\
	"grafica32.dat" using 1:3 title "Logaritmo 2" with linespoints ls 2 lw 1.5 pt 7 ps 1,\
	"grafica32.dat" using 1:4 title "Logaritmo 10" with linespoints ls 3 lw 1.5 pt 7 ps 1
