@echo off
g++ "sigma.cpp" -o "sigma"
sigma.exe

start gnuplot grafica.p
