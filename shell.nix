{ pkgs ? import <nixpkgs> { } }:
with pkgs;
mkShell {
  buildInputs = [
    jekyll
  ];

  shellHook = ''
    # ...
  '';
}
