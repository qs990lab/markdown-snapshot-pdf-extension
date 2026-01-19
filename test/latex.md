# Image Text Content

## Mathematical Expressions

$gen_{B_1} = \{d_1, d_2, d_3\}$

$kill_{B_1} = \{d_4, d_5, d_6, d_7\}$

$gen_{B_2} = \{d_4, d_5\}$

$kill_{B_2} = \{d_1, d_2, d_7\}$

$gen_{B_3} = \{d_6\}$

$kill_{B_3} = \{d_3\}$

$gen_{B_4} = \{d_7\}$

$kill_{B_4} = \{d_1, d_4\}$

## Transfer Function

$f_2(f_1(x)) = gen_2 \cup (gen_1 \cup (x - kill_1) - kill_2)$
$= (gen_2 \cup (gen_1 - kill_2)) \cup (x - (kill_1 \cup kill_2))$

## General Rule

This rule extends to a block consisting of any number of statements. Suppose block $B$ has $n$ statements, with transfer functions $f_i(x) = gen_i \cup (x - kill_i)$ for $i = 1, 2, \ldots, n$. Then the transfer function for block $B$ may be written as:

$f_B(x) = gen_B \cup (x - kill_B),$

where

$kill_B = kill_1 \cup kill_2 \cup \cdots \cup kill_n$

and

$gen_B = gen_n \cup (gen_{n-1} - kill_n) \cup (gen_{n-2} - kill_{n-1} - kill_n) \cup$
$\cdots \cup (gen_1 - kill_2 - kill_3 - \cdots - kill_n)$
